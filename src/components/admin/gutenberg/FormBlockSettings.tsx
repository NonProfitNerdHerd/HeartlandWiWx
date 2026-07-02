import type { Block } from '../../../types/blocks';
import SpacingSettings from './SpacingSettings';

interface Props {
	block: Block;
	onChange: (block: Block) => void;
	formOptions: { id: string; name: string }[];
}

export default function FormBlockSettings({ block, onChange, formOptions }: Props) {
	return (
		<div className="gb-settings-fields">
			<label>
				Form
				<select
					value={String(block.props.formId ?? '')}
					onChange={(e) => onChange({ ...block, props: { ...block.props, formId: e.target.value } })}
				>
					<option value="">Select a form…</option>
					{formOptions.map((f) => (
						<option key={f.id} value={f.id}>{f.name}</option>
					))}
				</select>
			</label>
			{formOptions.length === 0 ? (
				<p className="gb-settings-hint">
					No forms yet. Create one under <strong>Forms</strong> in the admin menu.
				</p>
			) : null}
			<SpacingSettings block={block} onChange={onChange} />
		</div>
	);
}
