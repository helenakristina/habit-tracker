"use client";

import { HabitFormData } from "@/types";
import Modal from "@/components/ui/Modal";
import HabitForm from "./HabitForm";

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => void;
  initialData?: HabitFormData;
  title?: string;
  submitLabel?: string;
}

export default function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = "New Habit",
  submitLabel = "Create Habit",
}: HabitFormModalProps) {
  const handleSubmit = (data: HabitFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <HabitForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel={submitLabel}
      />
    </Modal>
  );
}
