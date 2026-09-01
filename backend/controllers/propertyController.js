const Property = require("../models/Property");

// GET /api/properties  (public)
const getAllProperties = async (req, res) => {
    try {
        const properties = await Property
            .find()
            .populate({ path: "owner", select: "fullName email phone" })
            .sort({ createdAt: -1 });

        res.status(200).json(properties);
    } catch (error) {
        console.error("Get properties error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/properties/:id  (public)
const getPropertyById = async (req, res) => {
    try {
        const property = await Property
            .findById(req.params.id)
            .populate({ path: "owner", select: "fullName email phone" });

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.status(200).json(property);
    } catch (error) {
        console.error("Get property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/properties  (authenticated)
const createProperty = async (req, res) => {
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
            location
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
            owner: req.user.userId
        });

        await property.save();

        res.status(201).json({
            message: "Property created successfully",
            property
        });

    } catch (error) {
        console.error("Create property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE /api/properties/:id  (authenticated, owner only)
const deleteProperty = async (req, res) => {
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
        console.error("Delete property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    createProperty,
    deleteProperty
};