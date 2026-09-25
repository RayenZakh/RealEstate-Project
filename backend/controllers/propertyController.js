const Property = require("../models/Property");

// GET /api/properties  (public)
const getAllProperties = async (req, res, next) => {
    try {
        const properties = await Property
            .find()
            .populate({ path: "owner", select: "fullName email phone" })
            .sort({ createdAt: -1 });

        res.status(200).json(properties);
    } catch (error) {
        next(error);
    }
};

// GET /api/properties/:id  (public)
const getPropertyById = async (req, res, next) => {
    try {
        const property = await Property
            .findById(req.params.id)
            .populate({ path: "owner", select: "fullName email phone" });

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.status(200).json(property);
    } catch (error) {
        next(error);
    }
};

// POST /api/properties  (authenticated)
const createProperty = async (req, res, next) => {
    try {
        const {
            title,
            description,
            price,
            listingType,
            propertyType,
            bedrooms,
            bathrooms,
            area,
            location,
            images
        } = req.body;

        if (
            !title || !description || !price || !listingType ||
            !propertyType || !area || !location ||
            location.latitude === undefined || location.longitude === undefined
        ) {
            return res.status(400).json({
                message: "Please provide all required information"
            });
        }

        const property = new Property({
            title,
            description,
            price,
            listingType,
            propertyType,
            bedrooms: bedrooms || 0,
            bathrooms: bathrooms || 0,
            area,
            location,
            images: Array.isArray(images) ? images : [],
            owner: req.user.userId
        });

        await property.save();

        res.status(201).json({
            message: "Property created successfully",
            property
        });

    } catch (error) {
        next(error);
    }
};

// DELETE /api/properties/:id  (authenticated, owner only)
const deleteProperty = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (property.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this property"
            });
        }

        await property.deleteOne();

        res.status(200).json({ message: "Property deleted successfully" });

    } catch (error) {
        next(error);
    }
};

// PUT /api/properties/:id  (authenticated, owner only)
const updateProperty = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // Ownership verification: only the owner can modify their property
        if (property.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to edit this property"
            });
        }

        const {
            title,
            description,
            price,
            listingType,
            propertyType,
            bedrooms,
            bathrooms,
            area,
            location,
            images
        } = req.body;

        if (title !== undefined) property.title = title;
        if (description !== undefined) property.description = description;
        if (price !== undefined) property.price = Number(price);
        if (listingType !== undefined) property.listingType = listingType;
        if (propertyType !== undefined) property.propertyType = propertyType;
        if (bedrooms !== undefined) property.bedrooms = Number(bedrooms);
        if (bathrooms !== undefined) property.bathrooms = Number(bathrooms);
        if (area !== undefined) property.area = Number(area);

        if (location) {
            if (location.city) property.location.city = location.city;
            if (location.latitude !== undefined) property.location.latitude = Number(location.latitude);
            if (location.longitude !== undefined) property.location.longitude = Number(location.longitude);
        }

        if (images !== undefined) {
            property.images = Array.isArray(images) ? images : [];
        }

        await property.save();

        res.status(200).json({
            message: "Property updated successfully",
            property
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
};