export default function Filters({ products, categories, setFiltered }) {
  const handleSort = (e) => {
    const order = e.target.value;
    setFiltered(prev => [...prev].sort((a, b) => 
      order === "asc" 
        ? parseFloat(a.final_price) - parseFloat(b.final_price)
        : parseFloat(b.final_price) - parseFloat(a.final_price)
    ));
  };

  const handleCategory = (e) => {
    const catId = e.target.value;
    if (catId === "all") setFiltered(products);
    else setFiltered(products.filter(p => p.category_id === Number(catId)));
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <select onChange={handleSort} className="p-3 border rounded-lg shadow">
        <option value="">Ordenar por precio</option>
        <option value="asc">Menor a mayor</option>
        <option value="desc">Mayor a menor</option>
      </select>

      <select onChange={handleCategory} className="p-3 border rounded-lg shadow">
        <option value="all">Todas las categorías</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}