import styles from "./StatusBadge.module.css";

const MAP: Record<string, { label: string; cls: string }> = {
  seeking_investment: { label: "Seeking Investment", cls: styles.investor },
  open_to_collaborate: { label: "Open to Collaborate", cls: styles.collab },
  sharing_idea: { label: "Sharing Idea", cls: styles.idea },
};

export default function StatusBadge({ status }: { status: string }) {
  const item = MAP[status];
  if (!item) return null;
  return <span className={`${styles.badge} ${item.cls}`}>{item.label}</span>;
}
