import { User, TrendingUp, DollarSign, Calendar as CalIcon } from "lucide-react";
export default function DashboardCards({ title, value }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

export default function DashboardCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className={`p-2 w-fit rounded-lg bg-gray-50 mb-3 ${s.color}`}>
            <s.icon size={24} />
          </div>
          <p className="text-gray-500 text-sm font-medium">{s.label}</p>
          <h3 className="text-2xl font-bold mt-1">{s.val}</h3>
        </div>
      ))}
    </div>
  );
}
