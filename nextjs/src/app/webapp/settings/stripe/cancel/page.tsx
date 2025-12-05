export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-red-600">Payment Canceled</h1>
      <p>You can try again whenever you’re ready.</p>
      <a href="/webapp/settings/stripe" className="mt-4 px-4 py-2 bg-gray-200 rounded">
        Return to checkout
      </a>
    </div>
  );
}
