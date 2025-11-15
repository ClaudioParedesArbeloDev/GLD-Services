import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem("gld-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
        localStorage.removeItem("gld-cart");
      }
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("gld-cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("gld-cart");
    }
  }, [cart]);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    // DEBUG: Ver qué viene en el producto
    console.log("🔍 PRODUCTO RECIBIDO:", product);
    console.log("📸 product.image_url:", product.image_url);
    console.log("📸 product.images:", product.images);
    
    // SI HAY IMÁGENES, mostrar la estructura de la primera
    if (product.images && product.images.length > 0) {
      console.log("🔎 PRIMERA IMAGEN COMPLETA:", product.images[0]);
      console.log("🔎 Propiedades disponibles:", Object.keys(product.images[0]));
    }
    
    // Extraer la imagen correctamente
    let imageUrl = null;
    
    if (product.image_url) {
      // Caso 1: Tiene image_url directo (ProductList)
      imageUrl = product.image_url;
      console.log("✅ Imagen encontrada en product.image_url:", imageUrl);
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Caso 2: Tiene array de images (ProductDetail)
      console.log("🔍 Buscando imagen en array de", product.images.length, "imágenes...");
      
      // Buscar imagen principal (is_main === 1)
      const mainImage = product.images.find(img => img.is_main === 1 || img.is_main === true);
      console.log("🔍 Imagen principal (is_main=1):", mainImage);
      
      if (mainImage && mainImage.url) {
        imageUrl = mainImage.url;
        console.log("✅ URL extraída de imagen principal:", imageUrl);
      } else if (product.images[0] && product.images[0].url) {
        // Si no hay principal, tomar la primera
        imageUrl = product.images[0].url;
        console.log("✅ URL extraída de primera imagen:", imageUrl);
      }
    } else if (product.image) {
      // Caso 3: Propiedad alternativa 'image'
      imageUrl = product.image;
      console.log("✅ Imagen encontrada en product.image:", imageUrl);
    }
    
    console.log("✅ IMAGEN FINAL SELECCIONADA:", imageUrl);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Si ya existe, actualizar cantidad
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si no existe, agregarlo
        const newItem = {
          id: product.id,
          title: product.title,
          price: parseFloat(product.price) || parseFloat(product.base_price) || 0,
          discount: parseFloat(product.discount) || parseFloat(product.discount_percent) || 0,
          final_price: product.final_price || (parseFloat(product.base_price) || 0) * (1 - (parseFloat(product.discount_percent) || 0) / 100),
          image_url: imageUrl,
          stock: product.stock,
          quantity: quantity,
          // ✅ AGREGAR PESO Y DIMENSIONES
          weight: parseFloat(product.weight) || null,
          length: parseFloat(product.length) || null,
          width: parseFloat(product.width) || null,
          height: parseFloat(product.height) || null,
        };
        
        console.log("🛒 ITEM QUE SE AGREGARÁ AL CARRITO:", newItem);
        
        return [...prevCart, newItem];
      }
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("gld-cart");
  };

  // Obtener cantidad total de items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Obtener subtotal (sin envío)
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.final_price * item.quantity, 0);
  };

  // Abrir/cerrar carrito
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(!isOpen);

  const value = {
    cart,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};