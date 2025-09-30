import { Avatar, Badge } from "antd";

export default function INotif() {
  return (
    <div className="flex gap-2">
      <Badge showZero count={0} size="small">
        <div className="bg-gray-50 font-mono italic font-semibold py-1 px-3 text-xs rounded">
          <p>IZIN</p>
        </div>
      </Badge>
      <Badge showZero count={0} size="small">
        <div className="bg-gray-50 font-mono italic font-semibold py-1 px-3 text-xs rounded">
          <p>SAKIT</p>
        </div>
      </Badge>
    </div>
  );
}
