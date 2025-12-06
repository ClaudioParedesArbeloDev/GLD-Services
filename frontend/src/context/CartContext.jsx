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


  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("gld-cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("gld-cart");
    }
  }, [cart]);

 
  const addToCart = (product, quantity = 1) => {

    console.log("🔍 PRODUCTO RECIBIDO:", product);
    console.log("📸 product.image_url:", product.image_url);
    console.log("📸 product.images:", product.images);
    

    if (product.images && product.images.length > 0) {
      console.log("🔎 PRIMERA IMAGEN COMPLETA:", product.images[0]);
      console.log("🔎 Propiedades disponibles:", Object.keys(product.images[0]));
    }
    
   
    let imageUrl = null;
    
    if (product.image_url) {
      
      imageUrl = product.image_url;
      console.log("✅ Imagen encontrada en product.image_url:", imageUrl);
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
     
      console.log("🔍 Buscando imagen en array de", product.images.length, "imágenes...");
      
     
      const mainImage = product.images.find(img => img.is_main === 1 || img.is_main === true);
      console.log("🔍 Imagen principal (is_main=1):", mainImage);
      
      if (mainImage && mainImage.url) {
        imageUrl = mainImage.url;
        console.log("✅ URL extraída de imagen principal:", imageUrl);
      } else if (product.images[0] && product.images[0].url) {
       
        imageUrl = product.images[0].url;
        console.log("✅ URL extraída de primera imagen:", imageUrl);
      }
    } else if (product.image) {
     
      imageUrl = product.image;
      console.log("✅ Imagen encontrada en product.image:", imageUrl);
    }
    
    console.log("✅ IMAGEN FINAL SELECCIONADA:", imageUrl);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        
        const newItem = {
          id: product.id,
          title: product.title,
          price: parseFloat(product.price) || parseFloat(product.base_price) || 0,
          discount: parseFloat(product.discount) || parseFloat(product.discount_percent) || 0,
          final_price: product.final_price || (parseFloat(product.base_price) || 0) * (1 - (parseFloat(product.discount_percent) || 0) / 100),
          image_url: imageUrl,
          stock: product.stock,
          quantity: quantity,
         
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

  
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

 
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


  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("gld-cart");
  };

 
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };


  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.final_price * item.quantity, 0);
  };

 
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