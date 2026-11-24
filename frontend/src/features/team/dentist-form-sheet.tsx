import { useEffect, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PlusIcon, SaveIcon, UserCogIcon } from 'lucide-react'
import type { Dentist } from '@/domain/types'
import { dentistFormSchema, type DentistFormValues } from '@/domain/schemas'
import { useClinic } from '@/data/clinic-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Field, FormSection } from '@/components/shared/form-field'
import { formatCro, formatPhone } from '@/lib/format'
import { masked } from '@/lib/form'

interface DentistFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dentist?: Dentist
}

export function DentistFormSheet({
  open,
  onOpenChange,
  dentist,
}: DentistFormSheetProps) {
  const { dentists, createDentist, updateDentist } = useClinic()

  const defaults = useMemo<DentistFormValues>(
    () => ({
      name: dentist?.name ?? '',
      email: dentist?.email ?? '',
      phone: dentist?.phone ?? '',
      cro: dentist?.cro ?? '',
      specialty: dentist?.specialty ?? '',
      bio: dentist?.bio ?? '',
    }),
    [dentist],
  )

  const form = useForm<DentistFormValues>({
    resolver: zodResolver(dentistFormSchema) as Resolver<DentistFormValues>,
    defaultValues: defaults,
  })
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = form

  useEffect(() => {
    if (open) reset(defaults)
  }, [defaults, open, reset])

  const onSubmit = (values: DentistFormValues) => {
    const duplicatedEmail = dentists.find(
      (member) =>
        member.id !== dentist?.id &&
        member.email.toLowerCase() === values.email.trim().toLowerCase(),
    )
    if (duplicatedEmail) {
      setError('email', {
        message: 'Já existe um profissional com este e-mail.',
      })
      return
    }

    const payload = {
      ...values,
      email: values.email.trim(),
      phone: values.phone.trim(),
      cro: values.cro.trim(),
      bio: values.bio?.trim() ?? '',
    }

    if (dentist) {
      updateDentist(dentist.id, payload)
      toast.success('Cadastro atualizado', {
        description: `${values.name} · dados salvos na equipe.`,
      })
    } else {
      createDentist(payload)
      toast.success('Dentista cadastrado', {
        description: `${values.name} já pode entrar com o e-mail e a senha demo.`,
      })
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-[540px]">
        <SheetHeader className="border-b border-border px-5 py-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-primary">
            {dentist ? 'Editar profissional' : 'Novo dentista'}
          </p>
          <SheetTitle className="display-title mt-1 text-[1.8rem] font-normal">
            {dentist ? 'Atualize o cadastro' : 'Quem chega à equipe?'}
          </SheetTitle>
          <SheetDescription>
            {dentist
              ? 'Dados de contato e apresentação do profissional.'
              : 'O novo dentista entra com acesso apenas aos próprios pacientes e à própria agenda.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <FormSection title="Identificação">
              <Field label="Nome completo" error={errors.name?.message}>
                <Input
                  {...register('name')}
                  placeholder="Ex.: Dra. Helena Barros"
                  autoFocus
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="E-mail" error={errors.email?.message}>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="helena@clareia.app"
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field label="Telefone" error={errors.phone?.message}>
                  <Input
                    {...masked(register('phone'), formatPhone)}
                    placeholder="(11) 99999-0000"
                    inputMode="tel"
                    maxLength={15}
                    aria-invalid={Boolean(errors.phone)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Atuação"
              description="Como este profissional aparece para a clínica."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="CRO" error={errors.cro?.message}>
                  <Input
                    {...masked(register('cro'), formatCro)}
                    placeholder="CRO-SP 00.000"
                    aria-invalid={Boolean(errors.cro)}
                  />
                </Field>
                <Field label="Especialidade" error={errors.specialty?.message}>
                  <Input
                    {...register('specialty')}
                    placeholder="Ex.: Ortodontia"
                    aria-invalid={Boolean(errors.specialty)}
                  />
                </Field>
              </div>

              <Field
                label="Apresentação"
                optional
                hint="Uma frase curta sobre o jeito de cuidar."
              >
                <Textarea
                  {...register('bio')}
                  placeholder="Ex.: foco em tratamentos preventivos e escuta atenta."
                  className="min-h-24"
                />
              </Field>
            </FormSection>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-[#F7FCFC] p-3.5">
              <span className="mt-0.5 inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                <UserCogIcon className="size-4" />
              </span>
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                O perfil de dono permanece exclusivo de quem fundou a clínica.
                Novos cadastros entram como dentistas, com acesso restrito.
              </p>
            </div>
          </div>

          <SheetFooter className="border-t border-border bg-[#FBFEFE] px-5 py-4">
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" className="flex-1 gap-2">
                {dentist ? (
                  <SaveIcon className="size-4" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                {dentist ? 'Salvar alterações' : 'Cadastrar dentista'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
