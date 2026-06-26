import ContentEditor from './ContentEditor';
import type { PageDocument } from '../../types/blocks';

interface Props {
	initialDocument: PageDocument;
	originalSlug: string;
	backUrl?: string;
	globalBlockOptions?: { id: string; name: string }[];
}

/** @deprecated Use ContentEditor with contentType="page" */
export default function PageEditor({ initialDocument, originalSlug, backUrl = '/admin/pages', globalBlockOptions = [] }: Props) {
	return (
		<ContentEditor
			contentType="page"
			initialDocument={initialDocument}
			originalSlug={originalSlug}
			backUrl={backUrl}
			globalBlockOptions={globalBlockOptions}
		/>
	);
}
