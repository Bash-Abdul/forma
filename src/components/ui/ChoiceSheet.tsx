import { Modal } from 'react-native';
import { Button, Heading, Screen } from './index';
import { Choice, SelectionGroup } from './SelectionGroup';
export function ChoiceSheet<T extends string | number>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: Choice<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Screen>
        <Heading title={title} />
        <SelectionGroup
          label="Choose an option"
          options={options}
          value={value}
          onChange={(v) => {
            onSelect(v);
            onClose();
          }}
        />
        <Button secondary label="Cancel" onPress={onClose} />
      </Screen>
    </Modal>
  );
}
