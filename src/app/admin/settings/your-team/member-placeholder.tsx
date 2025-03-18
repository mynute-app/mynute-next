const MemberPlaceholder = () => {
  return (
    <>
      <div className="flex items-center justify-between space-x-4 mb-6">
        <div className="flex justify-center items-start gap-4">
          {/* Avatar Placeholder */}
          <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center text-xl font-bold text-gray-500">
            ?
          </div>
          <div className="flex justify-start items-start flex-col mt-2">
            {/* Nome Placeholder */}
            <h1 className="text-2xl font-semibold text-gray-400">
              Nome Sobrenome
            </h1>
          </div>
        </div>

        {/* Placeholder para ações */}
        <div className="flex space-x-2">
          <div className="w-10 h-10 bg-gray-200 rounded" />
          <div className="w-10 h-10 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="flex space-x-4 border-b mt-4 mb-4">
        {["Sobre", "Integrations", "Services", "Working hours", "Breaks"].map(
          (tab, index) => (
            <div key={index} className="py-2 text-gray-400">
              {tab}
            </div>
          )
        )}
      </div>

      {/* Conteúdo Placeholder */}
      <div className="text-gray-400">Selecione um membro para ver os detalhes</div>
    </>
  );
};

export default MemberPlaceholder;
