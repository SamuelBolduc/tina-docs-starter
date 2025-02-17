import DocLayout from "../../components/DocLayout";
import { staticRequest, gql } from "tinacms";
import { sideMenuItems } from "../../utils/mdxUtils";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { Button } from "../../components";
import FeaturesBlock from "../../blocks/features-block";
import HeroBlock from "../../blocks/hero-block";
import Callout from "../../blocks/callout-block";
import ReactPlayer from "react-player/lazy";
import Page404 from "../404.js";
const components = {
  Callout: (props) => {
    return <Callout callout={props} />;
  },
  Button: (props) => {
    return (
      <Button as="a" href={props.url} variant={props.type}>
        {props.text}
      </Button>
    );
  },
  Hero: (props) => {
    return <HeroBlock hero={props} />;
  },
  FeatureSection: (props) => {
    return <FeaturesBlock features={props.featureList} />;
  },
  VideoPlayer: (props) => {
    return <ReactPlayer controls="true" url={props.url} />;
  },
};

function DocPage(props) {
  if (props.data && props.data.getDocsDocument) {
    const sideNav = sideMenuItems(props.data);
    return (
      <DocLayout
        title={props.data.getDocsDocument.data.title}
        navGroups={sideNav}
      >
        <TinaMarkdown
          components={components}
          content={props.data.getDocsDocument.data.body}
        />
      </DocLayout>
    );
  } else {
    return <Page404 />;
  }
}
export default DocPage;

export const getStaticProps = async ({ params }) => {
  const query = gql`
    query DocumentQuery($relativePath: String!) {
      getDocsDocument(relativePath: $relativePath) {
        data {
          title
          slug
          body
        }
      }
      getDocsList {
        edges {
          node {
            data {
              title
              slug
            }
            sys {
              path
            }
          }
        }
      }
    }
  `;

  const variables = { relativePath: `${params.slug}.mdx` };

  let data = {};
  try {
    data = await staticRequest({
      query,
      variables,
    });
  } catch (error) {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
    },
  };
};

export const getStaticPaths = async () => {
  const docsListData = await staticRequest({
    query: `#graphql
      {
        getDocsList {
          edges {
            node {
              sys {
                filename
              }
            }
          }
        }
      }
    `,
    variables: {},
  });
  return {
    paths:
      docsListData?.getDocsList?.edges?.map((doc) => ({
        params: { slug: doc.node.sys.filename },
      })) || [],
    fallback: "blocking",
  };
};
