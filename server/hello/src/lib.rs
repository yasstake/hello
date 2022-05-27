#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}

#[cfg(not(feature = "no-entrypoint"))]
pub mod entrypoint {

    use solana_program::{
        account_info::AccountInfo,
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        pubkey::Pubkey,
    };

    entrypoint!(process_instruction);

    pub fn process_instruction(
        _program_id: &Pubkey,
        _accounts: &[AccountInfo],
        _instruction_data: &[u8],
    ) -> ProgramResult {
        msg!("Hello world");

        Ok(())
    }
}
