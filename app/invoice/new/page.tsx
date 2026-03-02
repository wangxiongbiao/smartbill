import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function NewInvoicePage() {
    const id = nanoid();
    redirect(`/invoice/${id}`);
}
