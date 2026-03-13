
function startBlackjackGame() {
    alert(" Добро пожаловать за карточный стол!\n\nВаша цель: набрать сумму очков ближе к 21, чем у дилера, но не больше 21.");

    function drawCard() {
        return Math.floor(Math.random() * 10) + 2;
    }

    // --- Ход игрока ---
    let playerSum = 0;
    let playerCards = 0;
    let playerBusted = false;

    alert("Вы получаете первую карту...");
    playerSum = drawCard();
    playerCards = 1;
    alert(`Ваша карта: ${playerSum}. Сумма: ${playerSum}`);

    while (playerSum < 21) {
        let userInput;
        let validInput = false;

        while (!validInput) {
            userInput = prompt(`Ваша сумма: ${playerSum}. Берёте ещё карту? (да/нет)`);

            if (userInput === null) {
                alert("Игра завершена. Возвращайтесь ещё!");
                return;
            }

            const normalizedInput = userInput.trim().toLowerCase();

            if (normalizedInput === 'да' || normalizedInput === 'lf') {
                validInput = true;
                // Игрок берет карту
                let newCard = drawCard();
                playerSum += newCard;
                playerCards++;
                alert(`Выпала карта: ${newCard}. Новая сумма: ${playerSum}`);

                if (playerSum > 21) {
                    alert(`У вас перебор (${playerSum}). Вы проиграли АХАХХАХХААХХАХААХАХХА.`);
                    playerBusted = true;
                    break;
                }
            } 
            else if (normalizedInput === 'нет' || normalizedInput === 'ytn') {
                validInput = true;
                break;
            } 
            else {
                alert("Пожалуйста, введите 'да' или 'нет'.");
            }
        }

        if (playerBusted) {
            break;
        }

        if (playerSum <= 21 && userInput && userInput.trim().toLowerCase() === 'нет' || userInput && userInput.trim().toLowerCase() === 'ytn') {
            break;
        }
    }

    if (!playerBusted) {
        alert("Ход дилера...");
        let dealerSum = drawCard() + drawCard();
        alert(`Открытые карты дилера дают сумму: ${dealerSum}`);

        while (dealerSum < 17) {
            let newCard = drawCard();
            dealerSum += newCard;
            alert(`Дилер берет карту: ${newCard}. Сумма дилера: ${dealerSum}`);
        }

        if (dealerSum > 21) {
            alert(` Дилер перебрал (${dealerSum}). Вы выиграли!`);
        } else {
            if (playerSum > dealerSum) {
                alert(`Ваша сумма (${playerSum}) больше, чем у дилера (${dealerSum}). Вы победили!`);
            } else if (playerSum < dealerSum) {
                alert(`Ваша сумма (${playerSum}) меньше, чем у дилера (${dealerSum}). Вы проиграли АХАХАХХАХАХАХАХАХ.`);
            } else {
                alert(`Ничья! У вас и у дилера по ${playerSum}.`);
            }
        }
    }

    let playAgain = confirm("Хотите сыграть ещё раунд?");
    if (playAgain) {
        startBlackjackGame();
    } else {
        alert("Спасибо за игру! Возвращайтесь за стол.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const gameButton = document.getElementById('startGameBtn');
    if (gameButton) {
        gameButton.addEventListener('click', startBlackjackGame);
    }
});