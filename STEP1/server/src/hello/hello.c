#include <solana_sdk.h>

extern uint64_t entrypoint(const uint8_t *input) {
    sol_log("Hello");

    return SUCCESS;
}
