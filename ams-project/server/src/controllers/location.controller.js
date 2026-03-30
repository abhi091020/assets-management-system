// server/src/controllers/location.controller.js
import LocationModel from "../models/Location.model.js";
import { success, error } from "../utils/responseHelper.js";
import { logAudit, getRequestMeta } from "../utils/auditLogger.js";

export const getLocations = async (req, res) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const data = await LocationModel.findAll({ search, isActive, page, limit });
    return success(res, data, "Locations fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getActiveLocations = async (req, res) => {
  try {
    const data = await LocationModel.findAllActive();
    return success(res, data, "Active locations fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await LocationModel.findById(parseInt(req.params.id));
    if (!location) return error(res, "Location not found", 404);
    return success(res, location, "Location fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createLocation = async (req, res) => {
  try {
    const { locationName, address, city, state, pinCode } = req.body;
    if (!locationName) return error(res, "Location name is required", 400);

    const location = await LocationModel.create({
      locationName,
      address,
      city,
      state,
      pinCode,
      createdBy: req.user.id,
    });

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "CREATE",
      entity: "Location",
      entityId: location.id,
      entityCode: locationName,
      newValue: { locationName, city, state, pinCode },
      ipAddress,
      userAgent,
    });

    return success(res, location, "Location created successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { locationName, address, city, state, pinCode } = req.body;
    if (!locationName) return error(res, "Location name is required", 400);

    const existing = await LocationModel.findById(parseInt(req.params.id));
    const location = await LocationModel.update(parseInt(req.params.id), {
      locationName,
      address,
      city,
      state,
      pinCode,
      updatedBy: req.user.id,
    });
    if (!location) return error(res, "Location not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Location",
      entityId: parseInt(req.params.id),
      entityCode: locationName,
      oldValue: {
        locationName: existing?.location_name,
        city: existing?.city,
        state: existing?.state,
      },
      newValue: { locationName, city, state, pinCode },
      ipAddress,
      userAgent,
    });

    return success(res, location, "Location updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateLocationStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean")
      return error(res, "isActive (boolean) is required", 400);

    const existing = await LocationModel.findById(parseInt(req.params.id));
    const location = await LocationModel.updateStatus(
      parseInt(req.params.id),
      isActive,
      req.user.id,
    );
    if (!location) return error(res, "Location not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "UPDATE",
      entity: "Location",
      entityId: parseInt(req.params.id),
      entityCode: existing?.location_name,
      oldValue: { isActive: existing?.is_active },
      newValue: { isActive, status: isActive ? "Activated" : "Deactivated" },
      ipAddress,
      userAgent,
    });

    return success(
      res,
      location,
      `Location ${isActive ? "activated" : "deactivated"} successfully`,
    );
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const existing = await LocationModel.findById(parseInt(req.params.id));
    const result = await LocationModel.softDelete(
      parseInt(req.params.id),
      req.user.id,
    );
    if (!result) return error(res, "Location not found", 404);

    const { ipAddress, userAgent } = getRequestMeta(req);
    await logAudit({
      userId: req.user.id,
      userName: req.user.full_name || req.user.email,
      userRole: req.user.role,
      action: "DELETE",
      entity: "Location",
      entityId: parseInt(req.params.id),
      entityCode: existing?.location_name,
      oldValue: { locationName: existing?.location_name, city: existing?.city },
      ipAddress,
      userAgent,
    });

    return success(res, null, "Location deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
