import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    let {
      page = "1",
      limit = "10",
      sort,
      order = "asc",
      fields,
      ...filters
    } = req.query;

    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 100);

    const queryFilters = {};
    for (let key in filters) {
      let value = filters[key];

      if (typeof value === "object") {
        queryFilters[key] = {};
        for (let operator in value) {
          if (["gte", "lte", "gt", "lt", "ne"].includes(operator)) {
            queryFilters[key]["$" + operator] = parseFloat(value[operator]);
          }
        }
      } else if (Array.isArray(value)) {
        queryFilters[key] = { $in: value };
      } else if (key === "_id") {
        queryFilters[key] = value;
      } else if (!isNaN(value)) {
        queryFilters[key] = parseFloat(value);
      } else {
        queryFilters[key] = { $in: [value] };
      }
    }

    const sortOptions = {};
    if (sort) {
      const sortFields = sort.split(",").map((field) => field.trim());
      sortFields.forEach((field) => {
        sortOptions[field] = order === "desc" ? -1 : 1;
      });
    }

    let selectFields = {};
    if (fields) {
      selectFields = fields.split(",").join(" ");
    }

    const products = await Product.find(queryFilters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(selectFields);

    const total = await Product.countDocuments(queryFilters);

    res.json({ total, page, limit, products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
