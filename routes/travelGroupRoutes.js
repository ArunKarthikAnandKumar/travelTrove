const express = require("express");
const router = express.Router();
const multer = require("multer");
const parser = require("../utilites/parser");

const travelGroupService = require("../service/travelGroup");
const { isAuthenticated } = require("../utilites/authMiddleware");
const { createTravelGroupModel } = require("../model/TravelGroup");

// Multer setup for travel group image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/uploads/travel-groups");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fieldSize: 5 * 1024 * 1024 }, // 5MB max file size
});

// Create a new travel group
router.post("/addTravelGroup", async (req, res, next) => {
  try {
    const {
      itineraryId,
      itenaryName,
      name,
      description,
      maxMembers,
      startDate,
      endDate,
      pricePerPerson,
      meetingPoint,
      meetingTime,
      requirements,
      inclusions,
      exclusions,
      groupAdmin,
      isPrivate,
      thumbnail,
    } = req.body;

    const travelGroupObj = {
      itineraryId,
      itenaryName,
      name,
      description,
      maxMembers: parseInt(maxMembers, 10),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      pricePerPerson: parseFloat(pricePerPerson),
      meetingPoint,
      meetingTime,
      requirements: parser.parseArray(requirements),
      inclusions: parser.parseArray(inclusions),
      exclusions: parser.parseArray(exclusions),
      groupAdmin,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      thumbnail: thumbnail || null,
    };
    console.log(travelGroupObj);

    const data = await travelGroupService.createTravelGroup(travelGroupObj);
    res.status(201).json({
      success: true,
      message: "Travel group created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// Update a travel group
router.post("/updateTravelGroup/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(req.body)
    const updateData = { ...req.body };
    
    // Convert string dates to Date objects if they exist
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    
    // Convert string numbers to numbers
    if (updateData.maxMembers) updateData.maxMembers = parseInt(updateData.maxMembers, 10);
    if (updateData.pricePerPerson) updateData.pricePerPerson = parseFloat(updateData.pricePerPerson);
    
    // Handle arrays
    if (updateData.requirements) updateData.requirements = parser.parseArray(updateData.requirements);
    if (updateData.inclusions) updateData.inclusions = parser.parseArray(updateData.inclusions);
    if (updateData.exclusions) updateData.exclusions = parser.parseArray(updateData.exclusions);
    
    // Only update thumbnail if provided (base64 string)
    if (updateData.thumbnail && updateData.thumbnail.startsWith("data:image")) {
      // Keep the base64 thumbnail as is
    } else if (updateData.thumbnail) {
      // If it's not base64, remove it to keep existing thumbnail
      delete updateData.thumbnail;
    }
    
    const updatedGroup = await travelGroupService.updateTravelGroup(id, updateData);
    
    res.status(200).json({
      success: true,
      message: "Travel group updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    next(error);
  }
});

// Delete a travel group
router.delete("/deleteTravelGroup/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    await travelGroupService.deleteTravelGroup(id);
    
    res.status(200).json({
      success: true,
      message: "Travel group deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get all travel groups with optional filters
router.get("/getAllTravelGroups", async (req, res, next) => {
  try {
    const filters = {
      itenaryId: req.query.itineraryId,
      status: req.query.status,
      groupAdmin: req.query.groupAdmin,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
    };
    
    const travelGroups = await travelGroupService.fetchAllTravelGroups(filters);
    
    res.status(200).json({
      success: true,
      count: travelGroups.length,
      data: travelGroups,
    });
  } catch (error) {
    next(error);
  }
});

// Get a single travel group by ID
router.get("/getTravelGroup/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const travelGroup = await travelGroupService.getTravelGroupById(id);
    
    res.status(200).json({
      success: true,
      data: travelGroup,
    });
  } catch (error) {
    next(error);
  }
});

// Add member to travel group
router.post("/:groupId/addMember/:userId", async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const updatedGroup = await travelGroupService.addMember(groupId, userId);
    
    res.status(200).json({
      success: true,
      message: "Member added to travel group successfully",
      data: updatedGroup,
    });
  } catch (error) {
    next(error);
  }
});

// Remove member from travel group
router.delete("/:groupId/removeMember/:userId", async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const updatedGroup = await travelGroupService.removeMember(groupId, userId);
    
    res.status(200).json({
      success: true,
      message: "Member removed from travel group successfully",
      data: updatedGroup,
    });
  } catch (error) {
    next(error);
  }
});

// Update travel group status
router.patch("/:groupId/status", async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      const err = new Error("Status is required");
      err.status = 400;
      throw err;
    }
    
    const updatedGroup = await travelGroupService.updateGroupStatus(groupId, status);
    
    res.status(200).json({
      success: true,
      message: `Travel group status updated to ${status}`,
      data: updatedGroup,
    });
  } catch (error) {
    next(error);
  }
});

// Create travel group by registered user
router.post("/user/createTravelGroup", isAuthenticated, async (req, res, next) => {
  try {
    const {
      itineraryId,
      itenaryName,
      name,
      description,
      maxMembers,
      startDate,
      endDate,
      pricePerPerson,
      meetingPoint,
      meetingTime,
      requirements,
      inclusions,
      exclusions,
      isPrivate,
      thumbnail,
    } = req.body;

    const travelGroupObj = {
      itineraryId,
      itenaryName,
      name,
      description,
      maxMembers: parseInt(maxMembers, 10),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      pricePerPerson: parseFloat(pricePerPerson),
      meetingPoint,
      meetingTime,
      requirements: parser.parseArray(requirements),
      inclusions: parser.parseArray(inclusions),
      exclusions: parser.parseArray(exclusions),
      groupAdmin: req.user.id,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      thumbnail: thumbnail || null,
    };

    const data = await travelGroupService.createTravelGroup(travelGroupObj);
    res.status(201).json({
      success: true,
      message: "Travel group created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
});

// Join travel group with privacy check
router.post("/:groupId/join", isAuthenticated, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    const model = await createTravelGroupModel();
    const group = await model.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Travel group not found'
      });
    }
    
    // Check if group is private
    if (group.isPrivate) {
      // Check if user is invited
      const isInvited = group.invitedUsers.some(
        invite => invite.userId.toString() === userId
      );
      
      if (!isInvited) {
        return res.status(403).json({
          success: false,
          message: 'Cannot join private group without being invited'
        });
      }
    }
    
    // Check if already a member
    const isMember = group.members.some(member => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }
    
    // Check if group is full
    if (group.currentMembers >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'This travel group is already full'
      });
    }
    
    // Add member
    const updatedGroup = await travelGroupService.addMember(groupId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined travel group',
      data: updatedGroup
    });
  } catch (error) {
    next(error);
  }
});

// Invite user to travel group
router.post("/:groupId/invite", isAuthenticated, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const inviterId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const model = await createTravelGroupModel();
    const group = await model.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Travel group not found'
      });
    }
    
    // Check if user is admin of the group
    if (group.groupAdmin.toString() !== inviterId) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can invite users'
      });
    }
    
    // Check if already invited
    const isAlreadyInvited = group.invitedUsers.some(
      invite => invite.userId.toString() === userId
    );
    
    if (isAlreadyInvited) {
      return res.status(400).json({
        success: false,
        message: 'User has already been invited to this group'
      });
    }
    
    // Add invitation
    group.invitedUsers.push({
      userId,
      invitedAt: new Date(),
      invitedBy: inviterId
    });
    
    await group.save();
    
    res.status(200).json({
      success: true,
      message: 'User invited to travel group successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
