require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  }
});

const Producto = mongoose.model("Producto", productoSchema);

async function conectarDB() {
  try {
    console.log("MONGODB_URI =", JSON.stringify(process.env.MONGODB_URI));

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error al conectar:");
    console.error(error);
  }
}

conectarDB();

// READ
app.get("/api/productos", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE
app.post("/api/productos", async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE
app.put("/api/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!producto) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    res.json(producto);

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

// DELETE
app.delete("/api/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(
      req.params.id
    );

    if (!producto) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    res.json({
      mensaje: "Producto eliminado correctamente"
    });

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});