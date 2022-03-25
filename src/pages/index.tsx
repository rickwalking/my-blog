import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(null);

  useEffect(() => {
    const formattedPosts = postsPagination.results.map(post => ({
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
    }));

    setPosts(formattedPosts);
    setNextPage(postsPagination.next_page);
  }, [postsPagination]);

  const handleLoadMore = (): void => {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(response => {
        const results = response.results.map(post => ({
          uid: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            { locale: ptBR }
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }));

        setPosts([...posts, ...results]);
        setNextPage(response.next_page);
      });
  };

  return (
    <div className={commonStyles.container}>
      {posts.map(post => (
        <div className={styles.postsContainer} key={post.uid}>
          <h1>
            <Link href={`post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
          </h1>
          <p>{post.data.subtitle}</p>
          <div className={styles.postsDataDetails}>
            <div className={styles.iconDate}>
              <FiCalendar />
              <span>{post.first_publication_date}</span>
            </div>
            <div className={styles.authorData}>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
          </div>
        </div>
      ))}
      {nextPage ? (
        <div className={styles.loadMore}>
          <button type="button" onClick={handleLoadMore}>
            Carregar mais posts
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const nextPage = postsResponse.next_page ?? null;

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    next_page: nextPage,
    results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
