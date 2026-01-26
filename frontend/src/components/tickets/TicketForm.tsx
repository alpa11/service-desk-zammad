import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { Input } from '../common/Input';
import { useBranches } from '../../hooks/useBranches';
import { useIssueTypes } from '../../hooks/useIssueTypes';
import type { CreateTicketData, Branch } from '../../types';

const ticketSchema = z.object({
  branch_id: z.string().min(1, 'יש לבחור סניף'),
  issue_type_id: z.string().min(1, 'יש לבחור סוג תקלה'),
  description: z.string().min(5, 'התיאור חייב להכיל לפחות 5 תווים').max(1000),
  floor: z.string().optional(),
  building: z.string().optional(),
  wing: z.string().optional(),
  room: z.string().max(50).optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onSubmit: (data: CreateTicketData) => void;
  isLoading: boolean;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, isLoading }) => {
  const { data: branches = [], isLoading: branchesLoading } = useBranches({ active: true });
  const { data: issueTypes = [], isLoading: issueTypesLoading } = useIssueTypes();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  const selectedBranchId = watch('branch_id');
  const selectedBranch: Branch | undefined = branches.find(
    (b) => b.id === Number(selectedBranchId)
  );

  const onFormSubmit = (data: TicketFormData) => {
    onSubmit({
      branch_id: Number(data.branch_id),
      issue_type_id: Number(data.issue_type_id),
      description: data.description,
      floor: data.floor || undefined,
      building: data.building || undefined,
      wing: data.wing || undefined,
      room: data.room || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Select
        label="סניף"
        required
        placeholder="בחר סניף..."
        options={branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }))}
        error={errors.branch_id?.message}
        disabled={branchesLoading}
        {...register('branch_id')}
      />

      <Select
        label="סוג תקלה"
        required
        placeholder="בחר סוג תקלה..."
        options={issueTypes.map((it) => ({ value: it.id, label: it.name }))}
        error={errors.issue_type_id?.message}
        disabled={issueTypesLoading}
        {...register('issue_type_id')}
      />

      {selectedBranch?.has_floors && selectedBranch.floor_options && (
        <Select
          label="קומה"
          placeholder="בחר קומה..."
          options={selectedBranch.floor_options.map((f) => ({ value: f, label: f }))}
          {...register('floor')}
        />
      )}

      {selectedBranch?.has_buildings && selectedBranch.building_options && (
        <Select
          label="בניין"
          placeholder="בחר בניין..."
          options={selectedBranch.building_options.map((b) => ({ value: b, label: b }))}
          {...register('building')}
        />
      )}

      {selectedBranch?.has_wings && selectedBranch.wing_options && (
        <Select
          label="אגף"
          placeholder="בחר אגף..."
          options={selectedBranch.wing_options.map((w) => ({ value: w, label: w }))}
          {...register('wing')}
        />
      )}

      <Input
        label="חדר / כיתה"
        placeholder="לדוגמה: כיתה ג2"
        error={errors.room?.message}
        {...register('room')}
      />

      <Textarea
        label="תיאור הבעיה"
        required
        placeholder="תאר את הבעיה בפירוט..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          שלח קריאה
        </Button>
      </div>
    </form>
  );
};
