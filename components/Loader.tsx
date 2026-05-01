import styles from "./Loader.module.css";

interface LoaderProps {
  fullPage?: boolean;
  text?: string;
}

const Loader = ({ fullPage = false, text = "Loading..." }: LoaderProps) => {
  return (
    <div className={`${styles.loader} ${fullPage ? styles.fullPage : ""}`}>
      <div className={styles.spinner}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      <p className={styles.text}>{text}</p>
    </div>
  );
};

export default Loader;
