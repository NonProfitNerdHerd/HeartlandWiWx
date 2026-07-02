import type { Block } from '../../../types/blocks';
import TypographySettings from './TypographySettings';
import SpacingSettings from './SpacingSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

export default function ParagraphSettings({ block, onChange }: Props) {
	return (
		<>
			<p className="gb-settings-hint">Edit paragraph text on the canvas. Use settings below for formatting.</p>
			<TypographySettings block={block} onChange={onChange} />
			<SpacingSettings block={block} onChange={onChange} />
		</>
	);
}
