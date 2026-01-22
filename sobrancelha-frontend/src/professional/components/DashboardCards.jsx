export default function DashboardCard({ icon: Icon, title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className={`p-2 w-fit rounded-lg bg-gray-50 mb-3 ${color}`}>
        <Icon size={24} />
      </div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}
