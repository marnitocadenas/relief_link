import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8 py-6">
                <div className="card card-lg">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="card card-lg">
                    <UpdatePasswordForm />
                </div>

                <div className="card card-lg">
                    <DeleteUserForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}