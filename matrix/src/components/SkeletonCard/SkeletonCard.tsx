import { Card, Skeleton } from 'antd';

const SkeletonCard = ({ isDark }: { isDark: boolean }) => (
  <Card
    className={`overflow-hidden ${
      isDark ? 'bg-slate-800/50 border-white/[0.08]' : 'bg-white border-slate-200'
    }`}
    styles={{ body: { padding: 0 } }}
  >
    <Skeleton.Image active className="!w-full !h-44" />
    <div className="p-5">
      <Skeleton active paragraph={{ rows: 3 }} />
    </div>
  </Card>
);

export default SkeletonCard;