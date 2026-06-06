#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Map, String};

#[contracttype]
pub struct Estado {
    pub presupuesto: Map<String, i128>,
    pub ejecutado: Map<String, i128>,
}

#[contract]
pub struct TrackifyContract;

#[contractimpl]
impl TrackifyContract {
    /// Carga el presupuesto aprobado. Solo puede llamarse una vez.
    pub fn init(env: Env, partidas: Map<String, i128>) {
        let storage = env.storage().instance();
        if storage.has(&symbol_short!("INIT")) {
            panic!("ya inicializado");
        }
        let ejec: Map<String, i128> = Map::new(&env);
        storage.set(&symbol_short!("PRESUP"), &partidas);
        storage.set(&symbol_short!("EJEC"), &ejec);
        storage.set(&symbol_short!("INIT"), &true);
    }

    /// Acumula monto ejecutado en una partida y emite evento.
    pub fn registrar(
        env: Env,
        licitacion: String,
        partida: String,
        monto: i128,
        razon: String,
    ) {
        let storage = env.storage().instance();
        let mut ejec: Map<String, i128> = storage.get(&symbol_short!("EJEC")).unwrap();
        let acum = ejec.get(partida.clone()).unwrap_or(0);
        ejec.set(partida.clone(), acum + monto);
        storage.set(&symbol_short!("EJEC"), &ejec);

        env.events().publish(
            (symbol_short!("registrar"), partida),
            (licitacion, monto, razon),
        );
    }

    /// Devuelve presupuesto aprobado y monto ejecutado acumulado.
    pub fn get_estado(env: Env) -> Estado {
        let storage = env.storage().instance();
        Estado {
            presupuesto: storage.get(&symbol_short!("PRESUP")).unwrap(),
            ejecutado: storage.get(&symbol_short!("EJEC")).unwrap(),
        }
    }
}
