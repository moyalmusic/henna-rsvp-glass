
interface StatsCardsProps {
  total: number;
  attending: number;
  notAttending: number;
  notAnswered: number;
}

const StatsCards = ({ total, attending, notAttending, notAnswered }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="admin-card mb-0">
        <h3 className="text-lg font-medium mb-1">סה"כ אורחים</h3>
        <p className="text-2xl font-bold">{total}</p>
      </div>
      <div className="admin-card mb-0">
        <h3 className="text-lg font-medium mb-1">מגיעים</h3>
        <p className="text-2xl font-bold text-green-600">{attending}</p>
      </div>
      <div className="admin-card mb-0">
        <h3 className="text-lg font-medium mb-1">לא מגיעים</h3>
        <p className="text-2xl font-bold text-red-600">{notAttending}</p>
      </div>
      <div className="admin-card mb-0">
        <h3 className="text-lg font-medium mb-1">לא ענו</h3>
        <p className="text-2xl font-bold text-gray-600">{notAnswered}</p>
      </div>
    </div>
  );
};

export default StatsCards;
