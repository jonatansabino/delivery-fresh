import { test, expect, type Page } from "@playwright/test";
async function mockCep(page: Page) {
  await page.route("https://viacep.com.br/ws/**", (route) =>
    route.fulfill({
      json: {
        cep: "01001-000",
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      },
    }),
  );
}
async function address(page: Page) {
  await mockCep(page);
  await page.getByRole("button", { name: "Adicionar endereço", exact: true }).click();
  await page.getByLabel("CEP", { exact: true }).fill("01001-000");
  await expect(page.getByLabel("Rua / Logradouro")).toHaveValue("Praça da Sé");
  await page.getByLabel("Número", { exact: true }).fill("100");
  await page.getByLabel("Complemento (opcional)").fill("Sala 5");
  await page.getByRole("button", { name: "Salvar endereço", exact: true }).click();
  await expect(page.getByText(/Praça da Sé, 100/).first()).toBeVisible();
}
async function admin(page: Page, tab: string) {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Entrar na demonstração" }).click();
  await page.getByRole("button", { name: tab, exact: true }).click();
}
for (const width of [320, 360, 375, 390, 414, 430, 768, 1280]) {
  test(`navegação e layout em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/",
      "/cardapio",
      "/planos",
      "/produto/frango-arroz-feijao",
      "/carrinho",
      "/checkout",
      "/perfil",
      "/pedidos",
      "/favoritos",
      "/montar-plano",
      "/meu-plano",
      "/freshpoints",
      "/economia",
      "/notificacoes",
      "/admin",
    ]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      if (route === "/cardapio")
        await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `overflow em ${route}`,
      ).toBe(true);
    }
    await page.getByRole("button", { name: "Entrar na demonstração" }).click();
    for (const tab of [
      "Dashboard",
      "Categorias",
      "Cupons",
      "Zonas",
      "Horários",
      "Produção",
      "Entregas",
      "Backup",
      "Produtos",
    ]) {
      await page.getByRole("button", { name: tab, exact: true }).click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `overflow no Admin ${tab}`,
      ).toBe(true);
    }
    await page.getByRole("button", { name: "Editar", exact: true }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
}
test("plano, cupom, CEP, checkout, persistência, status e repetição", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/planos");
  await page.getByRole("button", { name: "Escolher plano" }).first().click();
  await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Aumentar", exact: true }).first().click();
  await page.goto("/carrinho");
  await page.getByRole("textbox", { name: "Cupom promocional", exact: true }).fill("FIT10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByText("Cupom FIT10 aplicado.", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "Finalizar pedido", exact: true }).click();
  await address(page);
  await page.getByLabel("Data desejada de entrega").selectOption({ index: 1 });
  await page.getByLabel("Nome completo").fill("Cliente Teste");
  await page.getByLabel("WhatsApp", { exact: true }).fill("11987654321");
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({ status: 200, body: "WhatsApp simulado no teste" }),
  );
  await page.getByRole("button", { name: "Salvar pedido e abrir WhatsApp" }).dblclick();
  await expect(
    page.getByRole("heading", { name: "Pedido salvo neste dispositivo!" }),
  ).toBeVisible();
  await page.goto("/pedidos");
  await expect(page.getByText("Aguardando pagamento", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("Aguardando pagamento", { exact: true }).first()).toBeVisible();
  await admin(page, "Pedidos");
  await page.getByLabel("Status do pedido").first().selectOption("confirmado");
  await page.goto("/freshpoints");
  await expect(page.getByText(/\d+ pontos/).first()).toBeVisible();
  await page.goto("/pedidos");
  await expect(page.getByText("Confirmado", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Repetir pedido" }).click();
  await expect(page.getByRole("heading", { name: "Carrinho", exact: true })).toBeVisible();
});
test("wizard de oito etapas organiza unidades e preserva semana", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto("/montar-plano");
  await expect(page.getByRole("heading", { name: "Objetivo", exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Objetivo", exact: true })
    .selectOption("Ganho de Massa");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: /Essencial/ }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByLabel("Vegano", { exact: true }).check();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Aumentar", exact: true }).first().click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Distribuir automaticamente" }).click();
  await expect(page.getByText("5 de 5 marmitas organizadas")).toBeVisible();
  await page.reload();
  await expect(page.getByText("5 de 5 marmitas organizadas")).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await address(page);
  await page.getByLabel("Data desejada de entrega").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Revisão", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Finalizar pedido", exact: true })).toBeVisible();
});
test("PWA guarda aplicação e módulos para navegação offline", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);
  await context.setOffline(true);
  await page.goto("/cardapio");
  await expect(page.getByRole("heading", { name: "Cardápio da semana" })).toBeVisible();
  await page.goto("/freshpoints");
  await expect(page.getByRole("heading", { name: "FreshPoints", exact: true })).toBeVisible();
  await expect(page.getByText(/Modo offline:/)).toBeVisible();
  await context.setOffline(false);
});
test("gerencia planos, clientes, perfil, tema e endereço estruturado", async ({ page }) => {
  await admin(page, "Planos");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Plano Teste Local");
  await page.getByLabel("Quantidade de marmitas").fill("7");
  await page.getByLabel("Preço por marmita (R$)").fill("18");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Plano Teste Local" })).toBeVisible();
  await page.getByRole("button", { name: "Clientes", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Cliente Fictício Novo");
  await page.getByLabel("Telefone", { exact: true }).fill("11987654321");
  await page.getByLabel("Endereço", { exact: true }).fill("Rua Fictícia, 500");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cliente Fictício Novo" })).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Excluir Cliente Fictício Novo" }).click();
  await expect(page.getByRole("heading", { name: "Cliente Fictício Novo" })).toHaveCount(0);
  await page.goto("/perfil");
  await page.getByLabel("Nome", { exact: true }).fill("Pessoa Teste");
  await page.getByLabel("Preferência alimentar").selectOption("Vegano");
  await page.getByLabel("Aparência").selectOption("dark");
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await address(page);
  await page.reload();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("Pessoa Teste");
  await expect(page.getByLabel("Preferência alimentar")).toHaveValue("Vegano");
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("button", { name: "Editar endereço", exact: true }).click();
  await page.getByLabel("Número", { exact: true }).fill("200");
  await page.getByRole("button", { name: "Salvar endereço", exact: true }).click();
  await expect(page.getByText(/Praça da Sé, 200/)).toBeVisible();
});
test("favoritos, avaliação e adicionais sobrevivem ao recarregamento", async ({ page }) => {
  await page.goto("/produto/frango-arroz-feijao");
  await page.getByRole("button", { name: /^Favoritar / }).click();
  await page.getByRole("checkbox", { name: /Porção extra/ }).check();
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.getByLabel("Comentário").fill("Teste de avaliação local");
  await page.getByRole("button", { name: "Salvar avaliação demonstrativa" }).click();
  await page.reload();
  await expect(page.getByText("Teste de avaliação local", { exact: true })).toBeVisible();
  await page.goto("/favoritos");
  await expect(
    page.getByRole("heading", { name: "Frango Grelhado com Arroz e Feijão Preto" }),
  ).toBeVisible();
  await page.goto("/carrinho");
  await expect(page.getByText(/Inclui R\$.*4,00 em adicionais/)).toBeVisible();
});
test("produção não duplica contagem ao alternar seleção e backup exige confirmação", async ({
  page,
}) => {
  await admin(page, "Produção");
  await page.getByRole("button", { name: "Selecionar todos" }).click();
  await page.getByRole("button", { name: "Preparar +1" }).click();
  await page.getByRole("button", { name: "Desmarcar todos" }).click();
  await page.getByRole("button", { name: "Selecionar todos" }).click();
  await page.getByRole("button", { name: "Preparar +1" }).click();
  await expect(page.getByRole("button", { name: "Preparar +1" })).toBeDisabled();
  await page.getByRole("button", { name: "Backup", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("freshbites-backup-v3.json");
  const backup = await page.evaluate(() => ({
    format: "freshbites-fit",
    version: 3,
    data: JSON.parse(localStorage.getItem("freshbites-local-v2")!),
  }));
  await page.getByLabel("Selecionar backup JSON").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByText("Backup validado • versão 3")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar importação e substituir dados" }).click();
  await expect(page.getByText("Backup importado com sucesso.")).toBeVisible();
  await page.getByLabel("Selecionar backup JSON").setInputFiles({
    name: "invalido.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"data":{}}'),
  });
  await expect(page.getByText(/Formato ou versão de backup incompatível/)).toBeVisible();
});

test("categorias, cupons, frete, horários e restauração demonstrativa", async ({ page }) => {
  await admin(page, "Categorias");
  await page.getByRole("button", { name: "Adicionar categoria", exact: true }).click();
  await page.getByLabel("Nome da categoria").fill("Especial");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Especial", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Produtos", exact: true }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).first().click();
  await page.getByRole("combobox", { name: "Categoria", exact: true }).selectOption("Especial");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await page.getByRole("button", { name: "Cupons", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar cupom", exact: true }).click();
  await page.getByLabel("Código", { exact: true }).fill("LOCAL5");
  await page.getByLabel("Tipo de desconto").selectOption("fixed");
  await page.getByLabel("Valor do desconto").fill("5");
  await page.getByLabel("Limite de utilização local").fill("1");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.getByRole("heading", { name: /LOCAL5/ })).toBeVisible();
  await page.getByRole("button", { name: "Zonas", exact: true }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).first().click();
  await page.getByLabel("Frete simulado (R$)").fill("15");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Sé.*15/ })).toBeVisible();
  await page.getByRole("button", { name: "Horários", exact: true }).click();
  await page.getByRole("button", { name: "Adicionar horário", exact: true }).click();
  await page.getByLabel("Dia da semana (0=Domingo a 6=Sábado)").fill("0");
  await page.getByLabel("Faixa de horário").fill("Domingo demo");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Domingo demo/ })).toBeVisible();
  await page.goto("/cardapio");
  await page.getByRole("button", { name: "Especial", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Frango Grelhado com Arroz e Feijão Preto" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar", exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await page.goto("/carrinho");
  await page.getByRole("textbox", { name: "Cupom promocional", exact: true }).fill("LOCAL5");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByText(/Cupom LOCAL5 aplicado/)).toBeVisible();
  await admin(page, "Backup");
  await page.getByRole("button", { name: "Restaurar Mock Data", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Restaurar Mock Data", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByText("Dados iniciais restaurados.")).toBeVisible();
  await page.goto("/cardapio");
  await expect(page.getByRole("button", { name: "Especial", exact: true })).toHaveCount(0);
});

test("revisão visual de referência mobile e desktop", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({ path: testInfo.outputPath("home-390.png") });
  await page.goto("/perfil");
  await page.getByLabel("Aparência").selectOption("dark");
  await page.screenshot({ path: testInfo.outputPath("perfil-dark-390.png") });
  await page.getByRole("button", { name: "Adicionar endereço", exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("endereco-dark-390.png"), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await admin(page, "Dashboard");
  await page.screenshot({ path: testInfo.outputPath("admin-dark-1280.png") });
});
