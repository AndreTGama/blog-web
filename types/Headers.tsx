export type HeaderAction = {
  label: string;
  href: string;
};

export type HeaderContentProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: HeaderAction;
};

export type HeaderHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage: string;
  headerClassName: string;
  contentClassName: string;
  action?: HeaderAction;
};

export type HeaderArticleProps = HeaderContentProps;
export type HeaderMainProps = HeaderContentProps;
