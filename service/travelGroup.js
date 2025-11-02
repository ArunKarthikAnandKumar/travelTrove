const { createTravelGroupModel } = require('../model/TravelGroup');
// Import the User model to ensure it's registered
require('../model/users');

let travelGroupServices = {};

travelGroupServices.createTravelGroup = async (travelGroupObj) => {
  console.log(travelGroupObj)
  let model = await createTravelGroupModel();
  let exist = await model.findOne({ 
    name: travelGroupObj.name,
    itenaryId: travelGroupObj.itineraryId,
    startDate: travelGroupObj.startDate
  });
  
  if (exist) {
    let err = new Error("A travel group with the same name and dates already exists for this itinerary");
    err.status = 400;
    throw err;
  } else {
    let data = await model.create(travelGroupObj);
    return data;
  }
};

travelGroupServices.deleteTravelGroup = async (id) => {
  let model = await createTravelGroupModel();
  let exist = await model.findById(id);
  if (exist) {
    // Check if there are any members in the group
    if (exist.currentMembers > 0) {
      let err = new Error("Cannot delete a travel group that has members. Please remove members first.");
      err.status = 400;
      throw err;
    }
    let data = await model.findByIdAndDelete(id);
    return data;
  } else {
    let err = new Error("Travel group does not exist");
    err.status = 404;
    throw err;
  }
};

travelGroupServices.updateTravelGroup = async (id, reqData) => {
  let model = await createTravelGroupModel();
  let exist = await model.findById(id);
  
  if (!exist) {
    let err = new Error("Travel group not found");
    err.status = 404;
    throw err;
  }
  
  // Prevent updating certain fields directly
  delete reqData.currentMembers;
  delete reqData.members;
  delete reqData.averageRating;
  
  // If updating maxMembers, ensure it's not less than currentMembers
  if (reqData.maxMembers && reqData.maxMembers < exist.currentMembers) {
    let err = new Error(`Cannot set max members less than current members (${exist.currentMembers})`);
    err.status = 400;
    throw err;
  }
  
  const data = await model.findByIdAndUpdate(
    id,
    { $set: reqData },
    { new: true, runValidators: true }
  );
  
  return data;
};

travelGroupServices.addMember = async (groupId, userId) => {
  let model = await createTravelGroupModel();
  const group = await model.findById(groupId);
  
  if (!group) {
    let err = new Error("Travel group not found");
    err.status = 404;
    throw err;
  }
  
  // Check if already a member
  const isMember = group.members.some(member => member.user.toString() === userId.toString());
  if (isMember) {
    let err = new Error("User is already a member of this group");
    err.status = 400;
    throw err;
  }
  
  // Check if group is full
  if (group.currentMembers >= group.maxMembers) {
    let err = new Error("This travel group is already full");
    err.status = 400;
    throw err;
  }
  
  // Add member
  group.members.push({
    user: userId,
    status: 'confirmed'
  });
  
  // Increment current members count
  group.currentMembers += 1;
  
  await group.save();
  return group;
};

travelGroupServices.removeMember = async (groupId, userId) => {
  let model = await createTravelGroupModel();
  const group = await model.findById(groupId);
  
  if (!group) {
    let err = new Error("Travel group not found");
    err.status = 404;
    throw err;
  }
  
  // Check if user is a member
  const memberIndex = group.members.findIndex(
    member => member.user.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    let err = new Error("User is not a member of this group");
    err.status = 400;
    throw err;
  }
  
  // Remove member
  group.members.splice(memberIndex, 1);
  group.currentMembers -= 1;
  
  await group.save();
  return group;
};

travelGroupServices.fetchAllTravelGroups = async (filters = {}) => {
  const model = await createTravelGroupModel();

  const query = {};

  if (filters.itineraryId) query.itineraryId = filters.itineraryId;
  if (filters.status) query.status = filters.status;
  if (filters.groupAdmin) query.groupAdmin = filters.groupAdmin;

  if (filters.startDate) query.startDate = { $gte: new Date(filters.startDate) };
  if (filters.endDate) query.endDate = { $lte: new Date(filters.endDate) };

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  console.log("Query:", query);

  // First, get the basic travel groups data
  const travelGroups = await model
    .find(query)
    .sort({ startDate: 1, createdAt: -1 });

  console.log("Fetched travel groups:", travelGroups);
  
  // Return the basic data without population
  return travelGroups;
};

travelGroupServices.getTravelGroupById = async (id) => {
  const model = await createTravelGroupModel();
  const group = await model.findById(id);

  if (!group) {
    const err = new Error("Travel group not found");
    err.status = 404;
    throw err;
  }

  return group;
};

// New function to get populated travel group data
travelGroupServices.getPopulatedTravelGroup = async (travelGroupId) => {
  const model = await createTravelGroupModel();
  const Itinerary = require('../model/Itinerary'); // Make sure to import your Itinerary model
  const User = require('../model/users');

  // Get the basic travel group data
  const group = await model.findById(travelGroupId);
  
  if (!group) {
    const err = new Error("Travel group not found");
    err.status = 404;
    throw err;
  }

  // Convert to plain JavaScript object to modify it
  const result = group.toObject();
  
  // Get itinerary data
  if (result.itineraryId) {
    const itinerary = await Itinerary.findById(result.itineraryId)
      .select('title durationDays');
    result.itinerary = itinerary ? {
      _id: itinerary._id,
      title: itinerary.title,
      durationDays: itinerary.durationDays
    } : null;
  }
  
  // Get group admin data
  if (result.groupAdmin) {
    const admin = await User.findById(result.groupAdmin)
      .select('userName email');
    result.admin = admin ? {
      _id: admin._id,
      userName: admin.userName,
      email: admin.email
    } : null;
  }
  
  // Get members data
  if (result.members && result.members.length > 0) {
    const memberIds = result.members.map(m => m.user);
    const members = await User.find({ _id: { $in: memberIds } })
      .select('userName email');
      
    // Map members back to their original positions with user data
    result.members = result.members.map(member => {
      const userData = members.find(u => u._id.toString() === member.user.toString());
      return {
        ...member,
        user: userData ? {
          _id: userData._id,
          userName: userData.userName,
          email: userData.email
        } : null
      };
    });
  }
  
  return result;
};


travelGroupServices.updateGroupStatus = async (groupId, status) => {
  const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    let err = new Error("Invalid status. Must be one of: " + validStatuses.join(', '));
    err.status = 400;
    throw err;
  }
  
  let model = await createTravelGroupModel();
  const group = await model.findById(groupId);
  
  if (!group) {
    let err = new Error("Travel group not found");
    err.status = 404;
    throw err;
  }
  
  group.status = status;
  await group.save();
  
  return group;
};

module.exports = travelGroupServices;
