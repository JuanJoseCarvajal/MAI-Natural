import AdminProductsManager from "@/components/admin/AdminProductsManager";
import { getAllAdminProducts } from "@/app/admin/actions";

export default async function AdminProductsPage() {
  const { products } = await getAllAdminProducts();

  return (
    <div className="space-y-6">
      <AdminProductsManager initialProducts={products} />
    </div>
  );
}
