{/* Profile Content */}
<div className="flex-1 px-6 py-8 flex flex-col gap-5">
  
  {/* NAME */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-black tracking-widest" style={{ color: '#980422' }}>
      NAME
    </label>
    <div
      className="px-4 flex items-center"
      style={{
        border: '2px solid #980422',
        borderRadius: '999px',
        height: '48px',
        backgroundColor: 'white',
      }}
    >
      <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
        USERNAME
      </span>
    </div>
  </div>

  {/* USERNAME */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-black tracking-widest" style={{ color: '#980422' }}>
      USERNAME
    </label>
    <div
      className="px-4 flex items-center"
      style={{
        border: '2px solid #980422',
        borderRadius: '999px',
        height: '48px',
        backgroundColor: 'white',
      }}
    >
      <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
        USERNAME
      </span>
    </div>
  </div>

  {/* PASSWORD */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-black tracking-widest" style={{ color: '#980422' }}>
      PASSWORD
    </label>
    <button
      onClick={() => router.push('/forgot-password')}
      className="px-4 flex items-center w-full transition-opacity hover:opacity-70"
      style={{
        border: '2px solid #980422',
        borderRadius: '999px',
        height: '48px',
        backgroundColor: 'white',
      }}
    >
      <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
        ••••••••
      </span>
    </button>
  </div>

  {/* EMAIL */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-black tracking-widest" style={{ color: '#980422' }}>
      EMAIL
    </label>
    <div
      className="px-4 flex items-center"
      style={{
        border: '2px solid #980422',
        borderRadius: '999px',
        height: '48px',
        backgroundColor: 'white',
      }}
    >
      <span className="font-bold tracking-widest" style={{ color: '#980422' }}>
        EMAIL
      </span>
    </div>
  </div>

</div>