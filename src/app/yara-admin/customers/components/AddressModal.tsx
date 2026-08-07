export function AddressModal({
  selectedCustomerForAddress, setSelectedCustomerForAddress
}: any) {
  return (
    <>
      {selectedCustomerForAddress && (
        <div 
          className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCustomerForAddress(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl border border-burgundy/10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-bold text-burgundy">
                Addresses for {selectedCustomerForAddress.name}
              </h2>
              <button aria-label="Action" 
                onClick={() => setSelectedCustomerForAddress(null)}
                className="text-burgundy/50 hover:text-burgundy p-2 rounded-full hover:bg-burgundy/5 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {selectedCustomerForAddress.addresses && selectedCustomerForAddress.addresses.length > 0 ? (
              <div className="space-y-4">
                {selectedCustomerForAddress.addresses.map((address: any) => (
                  <div key={address.id} className="border border-burgundy/10 rounded-2xl p-4 bg-ivory/20 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-burgundy">{address.name}</span>
                      {address.isDefault && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-burgundy/70 space-y-1">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      {address.phone && (
                        <p className="pt-1 flex items-center gap-2">
                          <span className="text-burgundy/40 text-xs">📞</span> {address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-burgundy/50 text-center py-8 font-body">No addresses found for this customer.</p>
            )}
          </div>
        </div>
      )}

    </>
  );
}
