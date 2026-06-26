import { renderCardHtml } from '../../../lib/blocks/card';

interface Props {
	block: import('../../../types/blocks').Block;
}

export default function CardCanvas({ block }: Props) {
	const html = renderCardHtml(block);
	return <div className="block-card-canvas" dangerouslySetInnerHTML={{ __html: html }} />;
}
