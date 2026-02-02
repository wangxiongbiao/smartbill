import MainApp from "../../components/MainApp";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | SmartBill Pro',
    description: 'Manage your invoices, templates, and clients.',
};

export default function Dashboard() {
    return <MainApp />;
}
