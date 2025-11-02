import { Service } from '../models/service.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

 
const getPublicServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true });
  return res.status(200).json(new ApiResponse(200, services, req.t('servicesFetchedSuccess')));
});

 
const createService = asyncHandler(async (req, res) => {
  const { title, description, icon, isActive } = req.body;

  if (!title?.en || !title?.ne || !description?.en || !description?.ne || !icon) {
    throw new ApiError(400, req.t('errorAllFieldsRequired'));
  }

  const service = await Service.create({ title, description, icon, isActive });
  return res.status(201).json(new ApiResponse(201, service, req.t('serviceCreatedSuccess')));
});

 
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!updatedService) {
    throw new ApiError(404, req.t('errorServiceNotFound'));
  }

  return res.status(200).json(new ApiResponse(200, updatedService, req.t('serviceUpdatedSuccess')));
});
 
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);

  if (!service) {
    throw new ApiError(404, req.t('errorServiceNotFound'));
  }

  return res.status(200).json(new ApiResponse(200, {}, req.t('serviceDeletedSuccess')));
});

const getAdminAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find({});
  return res.status(200).json(new ApiResponse(200, services, req.t('servicesFetchedSuccess')));
});

export {
  createService, deleteService, getAdminAllServices, getPublicServices, updateService
};

