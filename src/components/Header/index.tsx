import Link from 'next/link';
import styles from './header.module.scss';

import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={commonStyles.container}>
      <div className={styles.containerContent}>
        <div className={styles.imageContainer}>
          <Link href="/">
            <a>
              <img
                src="/images/logo.svg"
                alt="logo"
                width="100%"
                height="100%"
              />
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
