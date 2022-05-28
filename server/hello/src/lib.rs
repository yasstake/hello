use std::str;


#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}

#[cfg(not(feature = "no-entrypoint"))]
pub mod myentrypoint {

    use solana_program::{
        account_info::AccountInfo,
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        pubkey::Pubkey,
    };

    entrypoint!(process_instruction);

    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        msg!("Hello world");
        // msg!(_program_id);                                
        // msg!(_accounts);
        let converted: String = String::from_utf8(instruction_data.to_vec()).unwrap();

        msg!("DATA:");
        msg!(&converted);

        Ok(())
    }
}

