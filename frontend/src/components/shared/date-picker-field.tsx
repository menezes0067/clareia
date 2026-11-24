import { CalendarDaysIcon } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDateCompact, parseISODate, toDateInputValue } from '@/lib/dates'

interface DatePickerFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  fromDate?: Date
  toDate?: Date
}

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = 'Escolha uma data',
  disabled,
  invalid,
  className,
  fromDate,
  toDate,
}: DatePickerFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-10 w-full justify-start gap-2 rounded-xl border-input bg-card px-3 text-left font-normal shadow-none hover:bg-secondary/60',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDaysIcon className="size-4 text-primary" strokeWidth={1.8} />
          {value ? formatDateCompact(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? parseISODate(value) : undefined}
          onSelect={(date) => {
            if (date) onChange(toDateInputValue(date))
          }}
          locale={ptBR}
          captionLayout="dropdown"
          startMonth={fromDate}
          endMonth={toDate}
          disabled={[
            ...(fromDate ? [{ before: fromDate }] : []),
            ...(toDate ? [{ after: toDate }] : []),
          ]}
          className="rounded-2xl"
        />
      </PopoverContent>
    </Popover>
  )
}
