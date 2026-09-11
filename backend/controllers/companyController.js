const Company = require('../models/Company');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate('recruiterId', 'name email');
    return sendSuccess(res, 'Companies retrieved', companies);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('recruiterId', 'name email');
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }
    return sendSuccess(res, 'Company retrieved', company);
  } catch (error) {
    next(error);
  }
};

// @desc    Create company
// @route   POST /api/companies
// @access  Private (Recruiter/Admin)
exports.createCompany = async (req, res, next) => {
  try {
    const { name, description, website, industry, location, logo } = req.body;
    const recruiterId = req.user.role === 'recruiter' ? req.user._id : (req.body.recruiterId || req.user._id);

    const company = await Company.create({
      name,
      description,
      website,
      industry,
      location,
      logo,
      recruiterId
    });

    return sendSuccess(res, 'Company created successfully', company, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Recruiter/Admin)
exports.updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    if (req.user.role === 'recruiter' && company.recruiterId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to edit this company', 403);
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, 'Company updated successfully', company);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return sendError(res, 'Company not found', 404);
    }

    await company.deleteOne();
    return sendSuccess(res, 'Company deleted successfully');
  } catch (error) {
    next(error);
  }
};
