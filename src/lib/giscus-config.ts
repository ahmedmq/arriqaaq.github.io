import { env } from '$env/dynamic/public';

export const GISCUS = {
	repo: env.PUBLIC_GISCUS_REPO || '',
	repoId: env.PUBLIC_GISCUS_REPO_ID || '',
	category: env.PUBLIC_GISCUS_CATEGORY || 'General',
	categoryId: env.PUBLIC_GISCUS_CATEGORY_ID || ''
};
