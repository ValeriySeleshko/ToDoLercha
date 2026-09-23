const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const modeArg = process.argv.find(a => a.startsWith('--mode='));
const targetMode = modeArg ? modeArg.split('=')[1] : 'baseline';
const outDir = path.join(__dirname, '..', 'audit_screenshots', targetMode);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const MODALS = [
  {
    num: '01',
    name: 'task_modal',
    title: 'Новая запись / Редактирование записи',
    open: async (page) => {
      await page.evaluate(() => window.app.openTaskModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeTaskModal());
    }
  },
  {
    num: '02',
    name: 'new_tab_modal',
    title: 'Новая вкладка',
    open: async (page) => {
      await page.evaluate(() => window.app.openNewTabModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeNewTabModal());
    }
  },
  {
    num: '03',
    name: 'edit_tab_modal',
    title: 'Настройка вкладки',
    open: async (page) => {
      await page.evaluate(() => window.app.openEditTabModal('todo'));
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeEditTabModal());
    }
  },
  {
    num: '04',
    name: 'new_section_modal',
    title: 'Новый блок (раздел)',
    open: async (page) => {
      await page.evaluate(() => window.app.openAddSectionModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeAddSectionModal());
    }
  },
  {
    num: '05',
    name: 'section_menu_modal',
    title: 'Управление блоком',
    open: async (page) => {
      await page.evaluate(() => {
        const secs = window.app.getTabSections(window.app.currentTab);
        const secId = (secs && secs[0]) ? secs[0].id : 'default';
        window.app.openSectionMenuModal(secId);
      });
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeSectionMenuModal());
    }
  },
  {
    num: '06',
    name: 'calendar_modal',
    title: 'Календарь блокнота',
    open: async (page) => {
      await page.evaluate(() => window.app.openCalendarModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeCalendarModal());
    }
  },
  {
    num: '07',
    name: 'sheet_export_modal',
    title: 'Экспорт листа (Поделиться днём)',
    open: async (page) => {
      await page.evaluate(() => window.app.openSheetExportModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeSheetExportModal());
    }
  },
  {
    num: '08',
    name: 'image_lightbox',
    title: 'Просмотрщик картинок Lightbox',
    open: async (page) => {
      await page.evaluate(() => window.app.openLightbox('assets/icons/app-icon.png'));
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeLightbox());
    }
  },
  {
    num: '09',
    name: 'nutrition_modal',
    title: '🥑 Питание (Главный экран)',
    open: async (page) => {
      await page.evaluate(() => window.app.openNutritionModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeNutritionModal());
    }
  },
  {
    num: '10',
    name: 'nutrition_add_food_modal',
    title: 'Добавить еду',
    open: async (page) => {
      await page.evaluate(() => window.app.openAddFoodModal('breakfast'));
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeAddFoodModal());
    }
  },
  {
    num: '11',
    name: 'nutrition_barcode_scanner',
    title: 'Сканер штрихкодов продуктов',
    open: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById('nutritionBarcodeScannerModalBackdrop');
        if (el) el.classList.add('open');
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        const el = document.getElementById('nutritionBarcodeScannerModalBackdrop');
        if (el) el.classList.remove('open');
      });
    }
  },
  {
    num: '12',
    name: 'nutrition_stats_modal',
    title: 'Статистика питания',
    open: async (page) => {
      await page.evaluate(() => window.app.openNutritionStatsModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeNutritionStatsModal());
    }
  },
  {
    num: '13',
    name: 'nutrition_settings_modal',
    title: 'Настройки питания',
    open: async (page) => {
      await page.evaluate(() => window.app.openNutritionSettingsModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeNutritionSettingsModal());
    }
  },
  {
    num: '14',
    name: 'nutrition_calc_modal',
    title: 'Калькулятор норм КБЖУ',
    open: async (page) => {
      await page.evaluate(() => window.app.openNutritionCalcModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeNutritionCalcModal());
    }
  },
  {
    num: '15',
    name: 'edit_meal_modal',
    title: 'Редактировать приём пищи',
    open: async (page) => {
      await page.evaluate(() => window.app.openMealEditModal('breakfast'));
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeMealEditModal());
    }
  },
  {
    num: '16',
    name: 'macro_color_modal',
    title: 'Цвет макронутриента БЖУ',
    open: async (page) => {
      await page.evaluate(() => window.app.openMacroColorPicker('protein'));
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeMacroColorPicker());
    }
  },
  {
    num: '17',
    name: 'hunger_cat_color_popup',
    title: 'Окрас котика сытости',
    open: async (page) => {
      await page.evaluate(() => window.app.openFoodCatColorPicker());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeFoodCatColorPicker());
    }
  },
  {
    num: '18',
    name: 'finance_modal',
    title: '💰 Финансы (Главный экран)',
    open: async (page) => {
      await page.evaluate(() => window.app.openFinanceModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeFinanceModal());
    }
  },
  {
    num: '19',
    name: 'finance_entry_modal',
    title: 'Ввод суммы (Калькулятор финансов)',
    open: async (page) => {
      await page.evaluate(() => window.app.openFinanceEntryModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeFinanceEntryModal());
    }
  },
  {
    num: '20',
    name: 'finance_category_modal',
    title: 'Управление категорией финансов',
    open: async (page) => {
      await page.evaluate(() => window.app.openFinanceCategoryModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeFinanceCategoryModal());
    }
  },
  {
    num: '21',
    name: 'finance_date_picker',
    title: 'Дата финансовой операции',
    open: async (page) => {
      await page.evaluate(() => window.app.openFinanceDatePicker());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeFinanceDatePicker());
    }
  },
  {
    num: '22',
    name: 'joy_modal',
    title: 'За что я благодарен сегодня?',
    open: async (page) => {
      await page.evaluate(() => window.app.openJoyModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeJoyModal());
    }
  },
  {
    num: '23',
    name: 'joy_jar_modal',
    title: 'Банка радости',
    open: async (page) => {
      await page.evaluate(() => window.app.openJoyJarModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeJoyJarModal());
    }
  },
  {
    num: '24',
    name: 'joy_sticker_picker',
    title: 'Выбор стикера для радости',
    open: async (page) => {
      await page.evaluate(() => window.app.openJoyStickerPicker());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeJoyStickerPicker());
    }
  },
  {
    num: '25',
    name: 'cycle_modal',
    title: 'Календарь цикла и здоровья',
    open: async (page) => {
      await page.evaluate(() => window.app.openCycleModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeCycleModal());
    }
  },
  {
    num: '26',
    name: 'cycle_add_modal',
    title: 'Запись цикла',
    open: async (page) => {
      await page.evaluate(() => window.app.openCycleAddModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeCycleAddModal());
    }
  },
  {
    num: '27',
    name: 'habit_modal',
    title: 'Новая привычка / Редактирование',
    open: async (page) => {
      await page.evaluate(() => window.app.openHabitModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeHabitModal());
    }
  },
  {
    num: '28',
    name: 'habit_period_dropdown',
    title: 'Выбор периода графиков привычки',
    open: async (page) => {
      await page.evaluate(() => {
        window.app.openHabitModal();
        const menu = document.getElementById('habitPeriodDropdownMenu');
        if (menu) menu.classList.add('show');
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        const menu = document.getElementById('habitPeriodDropdownMenu');
        if (menu) menu.classList.remove('show');
        window.app.closeHabitModal();
      });
    }
  },
  {
    num: '29',
    name: 'habit_stepper',
    title: 'Быстрый степпер привычки',
    open: async (page) => {
      await page.evaluate(() => {
        const b = document.getElementById('habitStepperBackdrop');
        if (b) {
          b.classList.add('open');
          b.setAttribute('aria-hidden', 'false');
        }
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        const b = document.getElementById('habitStepperBackdrop');
        if (b) {
          b.classList.remove('open');
          b.setAttribute('aria-hidden', 'true');
        }
      });
    }
  },
  {
    num: '30',
    name: 'pet_modal',
    title: 'Виртуальный питомец (Тамагочи)',
    open: async (page) => {
      await page.evaluate(() => {
        if (window.app.petSystem) window.app.petSystem.openPetModal();
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        if (window.app.petSystem) window.app.petSystem.closePetModal();
      });
    }
  },
  {
    num: '31',
    name: 'pet_settings_popup',
    title: 'Окрас шерсти питомца',
    open: async (page) => {
      await page.evaluate(() => {
        if (window.app.petSystem) {
          window.app.petSystem.openPetModal();
          if (window.app.petSystem.petSettingsPopup) {
            window.app.petSystem.petSettingsPopup.classList.add('show');
          }
        }
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        if (window.app.petSystem) {
          if (window.app.petSystem.petSettingsPopup) {
            window.app.petSystem.petSettingsPopup.classList.remove('show');
          }
          window.app.petSystem.closePetModal();
        }
      });
    }
  },
  {
    num: '32',
    name: 'achievements_modal',
    title: 'Достижения',
    open: async (page) => {
      await page.evaluate(() => window.app.openAchievementsModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeAchievementsModal());
    }
  },
  {
    num: '33',
    name: 'stickers_modal',
    title: 'Стикеры и декор',
    open: async (page) => {
      await page.evaluate(() => window.app.openStickersDrawer());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeStickersDrawer());
    }
  },
  {
    num: '34',
    name: 'sticker_context_popup',
    title: 'Контекстное меню стикера',
    open: async (page) => {
      await page.evaluate(() => {
        const popup = document.getElementById('stickerContextPopup');
        const b = document.getElementById('stickerContextBackdrop');
        if (b) b.style.display = 'block';
        if (popup) {
          popup.style.display = 'block';
          popup.style.position = 'fixed';
          popup.style.top = '300px';
          popup.style.left = '50%';
          popup.style.transform = 'translateX(-50%)';
        }
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        const popup = document.getElementById('stickerContextPopup');
        const b = document.getElementById('stickerContextBackdrop');
        if (b) b.style.display = 'none';
        if (popup) {
          popup.style.display = 'none';
          popup.style.position = '';
          popup.style.top = '';
          popup.style.left = '';
          popup.style.transform = '';
        }
      });
    }
  },
  {
    num: '35',
    name: 'modules_hub_dropdown',
    title: 'Меню хаба модулей (✦ Modules Hub)',
    open: async (page) => {
      await page.evaluate(() => window.app.openModulesHubDropdown());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeModulesHubDropdown());
    }
  },
  {
    num: '36',
    name: 'settings_modal',
    title: 'Настройки приложения',
    open: async (page) => {
      await page.evaluate(() => window.app.openSettingsModal());
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeSettingsModal());
    }
  },
  {
    num: '37',
    name: 'lang_dropdown',
    title: 'Выбор языка приложения',
    open: async (page) => {
      await page.evaluate(() => {
        window.app.openSettingsModal();
        const ld = document.getElementById('langDropdownMenu');
        if (ld) ld.classList.add('show');
      });
    },
    close: async (page) => {
      await page.evaluate(() => {
        const ld = document.getElementById('langDropdownMenu');
        if (ld) ld.classList.remove('show');
        window.app.closeSettingsModal();
      });
    }
  },
  {
    num: '38',
    name: 'confirm_modal',
    title: 'Окно подтверждения (Confirm Modal)',
    open: async (page) => {
      await page.evaluate(() => window.app.showConfirmModal('Удалить эту заметку?', () => {}));
    },
    close: async (page) => {
      await page.evaluate(() => window.app.closeConfirmModal());
    }
  }
];

async function runAudit() {
  console.log(`Starting UI Audit in [${targetMode.toUpperCase()}] mode...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[PAGE ERROR] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`[UNCAUGHT] ${err.toString()}`);
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise(r => setTimeout(r, 1000));

  let successCount = 0;
  for (const modal of MODALS) {
    const filename = `${modal.num}_${modal.name}.png`;
    const fullPath = path.join(outDir, filename);

    try {
      console.log(`[${modal.num}/38] Capturing: ${modal.title} -> ${filename}...`);
      await modal.open(page);
      // Wait for css animations / renders
      await new Promise(r => setTimeout(r, 450));
      await page.screenshot({ path: fullPath });
      await modal.close(page);
      await new Promise(r => setTimeout(r, 250));
      successCount++;
    } catch (err) {
      console.error(`ERROR capturing ${modal.name}:`, err.message);
    }
  }

  await browser.close();

  console.log(`\n======================================================`);
  console.log(`Audit finished! Captured ${successCount} of ${MODALS.length} screenshots in:`);
  console.log(outDir);
  console.log(`Console Errors detected: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors.join('\n'));
  }
  console.log(`======================================================\n`);
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
