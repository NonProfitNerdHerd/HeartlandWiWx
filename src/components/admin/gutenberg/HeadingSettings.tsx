import type { Block } from '../../../types/blocks';
import TypographySettings from './TypographySettings';
import SpacingSettings from './SpacingSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
}

export default function HeadingSettings({ block, onChange }: Props) {
	return (
		<>
			<p className="gb-settings-hint">Edit heading text on the canvas.</p>
			<TypographySettings block={block} onChange={onChange} showHeadingLevel />
			<SpacingSettings block={block} onChange={onChange} />
		</>
	);
}
