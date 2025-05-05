
interface GuestStatusBadgeProps {
  attending: boolean | null;
}

const GuestStatusBadge = ({ attending }: GuestStatusBadgeProps) => {
  if (attending === null) {
    return <span className="inline-block bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded">לא ענה/תה</span>;
  }
  if (attending) {
    return <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded">מגיע/ה</span>;
  }
  return <span className="inline-block bg-red-100 text-red-800 text-sm px-2 py-1 rounded">לא מגיע/ה</span>;
};

export default GuestStatusBadge;
