const food = [
  'food',
  'food--groceries',
  'food--restaurants',
  'food--coffee-tea',
  'food--alcohol',
  'food--snacks',
  'food--food-delivery',
]

const transportation = [
  'transportation',
  'transportation--public-transport',
  'transportation--taxi',
  'transportation--car-sharing',
  'transportation--air-travel',
  'transportation--rail-travel',
]

const car = [
  'car',
  'car--fuel',
  'car--maintenance',
  'car--car-wash',
  'car--accessories',
  'car--consumables',
  'car--parking',
  'car--tools',
  'car--insurance',
]

const housing = [
  'housing',
  'housing--rent',
  'housing--mortgage',
  'housing--utilities',
  'housing--repairs',
  'housing--furniture',
  'housing--insurance',
  'housing--household-supplies',
  'housing--tools',
  'housing--appliances',
]

const health = [
  'health',
  'health--medical',
  'health--pharmacy',
  'health--health-insurance',
  'health--fitness-sports',
  'health--dental-care',
]

const work = [
  'work',
  'work--equipment',
  'work--accessories',
  'work--software',
  'work--subscriptions',
  'work--consumables',
]

const taxes = ['taxes', 'taxes--fines', 'taxes--legal-services']

const kids = [
  'kids',
  'kids--education',
  'kids--toys',
  'kids--clothing',
  'kids--entertainment',
  'kids--medical-expenses',
]

const personal = [
  'personal',
  'personal--clothing',
  'personal--cosmetics',
  'personal--personal-care',
  'personal--accessories',
]

const entertainment = [
  'entertainment',
  'entertainment--equipment',
  'entertainment--movies-theater',
  'entertainment--games',
  'entertainment--events',
  'entertainment--subscriptions',
  'entertainment--books',
  'entertainment--hobbies',
]

const travel = [
  'travel',
  'travel--transportation',
  'travel--accommodation',
  'travel--tours',
  'travel--food',
  'travel--souvenirs',
  'travel--gear',
]

const education = [
  'education',
  'education--courses',
  'education--books-materials',
  'education--subscriptions',
  'education--seminars-workshops',
]

const pets = [
  'pets',
  'pets--pet-food',
  'pets--grooming',
  'pets--veterinary-care',
  'pets--toys-accessories',
]

const finance = [
  'finance',
  'finance--loans',
  'finance--savings',
  'finance--bank-fees',
  'finance--investments',
]

const gifts = ['gifts', 'gifts--charity', 'gifts--donations']

const miscellaneous = [
  'miscellaneous',
  'miscellaneous--uncategorized',
  'miscellaneous--other-expenses',
]

export const TRANSACTION_CATEGORIES = [
  ...food,
  ...transportation,
  ...car,
  ...housing,
  ...health,
  ...work,
  ...taxes,
  ...kids,
  ...personal,
  ...entertainment,
  ...travel,
  ...education,
  ...pets,
  ...finance,
  ...gifts,
  ...miscellaneous,
]

export const TRANSACTION_CATEGORIES_COLORS: { [key: string]: string } = {
  food: '#FAC515',
  transportation: '#F38744',
  car: '#FF692E',
  housing: '#FD6F8E',
  health: '#F670C7',
  work: '#E478FA',
  taxes: '#9B8AFB',
  kids: '#9B8AFB',
  personal: '#8098F9',
  entertainment: '#528BFF',
  travel: '#53B1FD',
  education: '#36BFFA',
  pets: '#22CCEE',
  finance: '#2ED3B7',
  gifts: '#3CCB7F',
  miscellaneous: '#85E13A',
}
