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
    let { page = 1, limit = 10, sort, order = "asc", ...filters } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    for (let key in filters) {
      if (Array.isArray(filters[key])) {
        filters[key] = { $in: filters[key] };
      } else if (typeof filters[key] === "object") {
        for (let operator in filters[key]) {
          filters[key][operator] = parseFloat(filters[key][operator]);
        }
      } else {
        filters[key] = isNaN(filters[key])
          ? { $in: [filters[key]] }
          : parseFloat(filters[key]);
      }
    }

    const sortOptions = {};
    if (sort) sortOptions[sort] = order === "desc" ? -1 : 1;

    const products = await Product.find(filters)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(filters);
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
