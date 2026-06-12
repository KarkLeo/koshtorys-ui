/**
 * Stories for SelectPlanningModal.
 *
 * LIMITATION: SelectPlanningModal calls `usePlanningList()` and `usePlanningMapper()` which
 * require a live Apollo client. Storybook has no Apollo provider, so mounting the real component
 * would throw at runtime. Instead, each story renders a thin wrapper component that accepts the
 * same shape of data via props and reproduces the modal's template using the same Shadcn
 * primitives — giving a faithful visual preview without a fragile Apollo mock.
 *
 * The fixture `mockPlanningTables` drives all three states: Empty, WithPlans, WithDisabledLinked.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, computed, h, defineComponent } from 'vue'

import ResponsiveSheet from '@/components/ui/responsive-sheet/ResponsiveSheet.vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import IconCalendar from '@/components/icons/IconCalendar.vue'

import type { PreparedPlanning } from '@/mappers/planning-mapper.ts'
import { mockPlanningTables } from './__fixtures__/planning.ts'

// ---------------------------------------------------------------------------
// Wrapper component — mirrors SelectPlanningModal template, data via props
// ---------------------------------------------------------------------------

const SelectPlanningModalDemo = defineComponent({
  name: 'SelectPlanningModalDemo',
  props: {
    tables: {
      type: Array as () => { category: string; items: PreparedPlanning[]; total: number }[],
      default: () => [],
    },
    loading: { type: Boolean, default: false },
    /** Pre-selected plan id; simulates oldPlanningId so one item renders disabled. */
    oldPlanningId: { type: String, default: null },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const open = ref(true)
    const model = ref<string | null>(null)

    const planningTransactionTable = computed(() =>
      props.tables
        .map((t) => ({ ...t, items: t.items.filter((p) => p.type === 'TRANSACTION') }))
        .filter((t) => t.items.length > 0),
    )

    const isDisabled = (planId: string, txCount: number) =>
      planId !== props.oldPlanningId && txCount > 0

    const cancelHandler = () => {
      model.value = null
    }
    const submitHandler = () => emit('submit', model.value)
    const closeHandler = () => emit('close')

    const sheetOpen = computed({
      get: () => open.value,
      set: (val: boolean) => {
        if (!val) closeHandler()
      },
    })

    return {
      sheetOpen,
      model,
      planningTransactionTable,
      isDisabled,
      cancelHandler,
      submitHandler,
      closeHandler,
    }
  },
  // Template uses render function to avoid SFC compiler requirement in Storybook
  render() {
    const { sheetOpen, model, planningTransactionTable, isDisabled, loading } = this
    return h(
      ResponsiveSheet,
      {
        open: sheetOpen,
        title: 'Обрати план',
        'onUpdate:open': (val: boolean) => {
          if (!val) this.closeHandler()
        },
      },
      {
        default: () => [
          h('div', { class: 'flex flex-col gap-6' }, [
            h('p', { class: 'text-sm text-muted-foreground' }, 'Оберіть план для транзакції'),

            // Loading
            loading
              ? h('div', { class: 'flex flex-col gap-3' }, [
                  h(Skeleton, { class: 'h-14 w-full rounded-xl' }),
                  h(Skeleton, { class: 'h-14 w-full rounded-xl' }),
                  h(Skeleton, { class: 'h-14 w-full rounded-xl' }),
                ])
              : planningTransactionTable.length === 0
                ? h(
                    'p',
                    {
                      class: 'my-4 text-center text-sm font-medium italic text-muted-foreground',
                    },
                    'Немає активних планів',
                  )
                : h(
                    RadioGroup,
                    {
                      modelValue: model,
                      class: 'gap-0',
                      'onUpdate:modelValue': (v: unknown) => {
                        this.model = v as string | null
                      },
                    },
                    {
                      default: () =>
                        planningTransactionTable.flatMap((table) =>
                          h(
                            'div',
                            {
                              key: table.category,
                              class: 'overflow-hidden rounded-xl border border-border',
                            },
                            table.items.map((plan) =>
                              h(
                                'label',
                                {
                                  key: plan.id,
                                  class: [
                                    'flex w-full cursor-pointer items-center gap-4 border-t border-border px-4 py-3 first:border-t-0',
                                    isDisabled(plan.id, plan?.original?.transactions?.length || 0)
                                      ? 'pointer-events-none opacity-50'
                                      : '',
                                  ],
                                },
                                [
                                  h(RadioGroupItem, {
                                    value: plan.id,
                                    disabled: isDisabled(
                                      plan.id,
                                      plan?.original?.transactions?.length || 0,
                                    ),
                                  }),
                                  h('span', { class: 'flex min-w-0 flex-1 flex-col gap-0.5' }, [
                                    h(
                                      'span',
                                      { class: 'truncate text-sm font-medium' },
                                      plan.description ?? '',
                                    ),
                                    h(
                                      Badge,
                                      {
                                        variant: 'outline',
                                        class: 'w-fit',
                                        style: {
                                          color: plan.categoryColor,
                                          borderColor: plan.categoryColor,
                                        },
                                      },
                                      { default: () => plan.categoryName },
                                    ),
                                  ]),
                                  plan.date
                                    ? h(
                                        'span',
                                        {
                                          class:
                                            'flex shrink-0 items-center gap-1 text-sm text-muted-foreground',
                                        },
                                        [h(IconCalendar, { class: 'size-4' }), ` ${plan.date}`],
                                      )
                                    : null,
                                  h(
                                    'span',
                                    {
                                      class:
                                        'ml-auto flex shrink-0 flex-row-reverse items-baseline gap-2',
                                    },
                                    [
                                      h(
                                        'span',
                                        { class: 'text-sm font-medium' },
                                        `${plan.amount} ${plan.currency}`,
                                      ),
                                      plan.originalAmount && plan.originalCurrency
                                        ? h(
                                            'span',
                                            { class: 'text-xs text-muted-foreground' },
                                            `${plan.originalAmount} ${plan.originalCurrency} /`,
                                          )
                                        : null,
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                    },
                  ),

            // Buttons
            h('div', { class: 'flex justify-end gap-2' }, [
              h(
                Button,
                { variant: 'outline', onClick: this.cancelHandler },
                {
                  default: () => 'Скасувати',
                },
              ),
              h(Button, { onClick: this.submitHandler }, { default: () => 'Обрати' }),
            ]),
          ]),
        ],
      },
    )
  },
})

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Transactions/SelectPlanningModal',
  component: SelectPlanningModalDemo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SelectPlanningModalDemo>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Loading state — 3 skeleton placeholders. */
export const Loading: Story = {
  args: { tables: [], loading: true },
}

/** No plans available. */
export const Empty: Story = {
  args: { tables: [], loading: false },
}

/** Two groups with 3 plans total; one plan (id "8") is already linked → disabled. */
export const WithPlans: Story = {
  args: { tables: mockPlanningTables, loading: false },
}

/**
 * Same data but `oldPlanningId="8"` — the previously linked plan is now ENABLED
 * (user is re-linking the same transaction) while other already-linked plans stay disabled.
 */
export const WithDisabledLinked: Story = {
  args: { tables: mockPlanningTables, loading: false, oldPlanningId: '8' },
}
