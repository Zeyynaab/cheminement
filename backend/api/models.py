from django.db import models

class Programme(models.Model):
    nom_programme = models.CharField(max_length=150)

    def __str__(self):
        return self.nom_programme


class Cours(models.Model):
    nom_cours = models.CharField(max_length=150)
    code_cours = models.CharField(max_length=20)
    credits = models.IntegerField()
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE)
    est_optionnel= models.BooleanField(default=False)
    #session = models.ForeignKey('Session',on_delete=models.CASCADE, related_name='cours_session')


    def __str__(self):
        return self.nom_cours


class Session(models.Model):
    nom_session = models.CharField(max_length=30)
    numero_session = models.IntegerField(default=1) 
    total_credits = models.IntegerField(default=0)
    cheminement = models.ForeignKey("Cheminement", on_delete=models.CASCADE, null=True, blank=True)
    #cours = models.ManyToManyField(Cours, blank=True)

    def __str__(self):
        return f"{self.nom_session} {self.numero_session}"


class Prerequis(models.Model):
    cours = models.ForeignKey(
        Cours, related_name="cours_principal", on_delete=models.CASCADE
    )
    prerequis = models.ForeignKey(
        Cours, related_name="cours_prerequis", on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.prerequis.nom_cours} (prérequis de {self.cours.nom_cours})"


class Cheminement(models.Model):
    etudiant = models.OneToOneField("Etudiant", on_delete=models.CASCADE)
    def __str__(self):
        return f"Cheminement de {self.etudiant.nom_etudiant}"


class Etudiant(models.Model):
    nom_etudiant = models.CharField(max_length=150)
    prenom_etudiant = models.CharField(max_length=150)
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE)

    def __str__(self):
        return self.nom_etudiant

class CoursParSession(models.Model):
    cheminement = models.ForeignKey("Cheminement", on_delete=models.CASCADE, related_name="cours_sessions", null=True, blank=True)
    cours = models.ForeignKey("Cours", on_delete=models.CASCADE)
    session = models.ForeignKey("Session", on_delete=models.CASCADE)  # Automne ou Hiver

    def __str__(self):
        return f"{self.cours.nom_cours} ({self.session.nom_session})"