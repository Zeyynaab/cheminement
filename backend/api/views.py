from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db.models import Sum
from .models import Etudiant, Cours, Programme, Prerequis, Session, Cheminement, CoursParSession
from .serializers import (
    EtudiantSerializer,
    CoursSerializer,
    ProgrammeSerializer,
    PrerequisSerializer,
    SessionSerializer,
    CoursParSessionSerializer
)
from collections import defaultdict

#vue pour la liste des programmes 
@api_view(['GET'])
def list_programmes(request):
    programmes = Programme.objects.all()
    serializer = ProgrammeSerializer(programmes, many=True)
    return Response(serializer.data)

#vue pour la liste des etudiants
@api_view(['GET'])
def list_etudiants(request):
    etudiants = Etudiant.objects.all()
    serializer = EtudiantSerializer(etudiants, many=True)
    return Response(serializer.data)

#vue pour la liste des cours
@api_view(['GET'])
def list_cours(request):
    cours = Cours.objects.all()
    serializer = CoursSerializer(cours, many=True)
    return JsonResponse(serializer.data, safe=False)

#vue pour ajouter un cours 
@api_view(['POST'])
def ajouter_cours(request):
    serializer = CoursSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

#vue pour modifier un cours
@api_view(['PUT'])
def modifier_cours(request, id):
    try:
        cours = Cours.objects.get(id=id)
    except Cours.DoesNotExist:
        return Response({"error": "Cours non trouvé"}, status=404)

    serializer = CoursSerializer(cours, data=request.data)
    if serializer.is_valid():
        serializer.save()
        CoursParSession.objects.filter(cours=cours).update(cours=serializer.instance)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

#vue pour supprimer un cours
@api_view(['DELETE'])
def supprimer_cours(request, id):
    try:
        cours = Cours.objects.get(id=id)
        # Supprime les entrées dans CoursParSession liées à ce cours
        CoursParSession.objects.filter(cours=cours).delete()
        
        cours.delete()
        return Response({"message": "Cours supprimé avec succès"}, status=204)
    except Cours.DoesNotExist:
        return Response({"error": "Cours non trouvé"}, status=404)

#vue pour la liste des prerequis
@api_view(['GET'])
def list_prerequis(request):
    prerequis = Prerequis.objects.all()
    serializer = PrerequisSerializer(prerequis, many=True)
    return Response(serializer.data)

#vue pour ajouter un prerequis
@api_view(['POST'])
def ajouter_prerequis(request):
    serializer = PrerequisSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

#vue pour la liste des sessions
@api_view(['GET'])
def list_sessions(request):
    sessions = Session.objects.all()
    serializer = SessionSerializer(sessions, many=True)
    return Response(serializer.data)

#vue pour associer un cours a une session
@api_view(['POST'])
def associer_cours_session(request):
    # Récupérer cours et session 
    id_cours   = request.data.get('id_cours')
    id_session = request.data.get('id_session')

    try:
        cours_obj   = Cours.objects.get(id=id_cours)
        session_obj = Session.objects.get(id=id_session)
    except Cours.DoesNotExist:
        return Response({'error': 'Cours non trouvé'}, status=404)
    except Session.DoesNotExist:
        return Response({'error': 'Session non trouvée'}, status=404)

    # Etudiant par def
    etudiant = Etudiant.objects.first()
    if not etudiant:
        return Response({'error': 'Aucun étudiant défini'}, status=404)

    #Crée ou récupére le cheminement
    cheminement, _ = Cheminement.objects.get_or_create(etudiant=etudiant)

    # Calcul les crédits déjà affectés la session
    credits_existants = CoursParSession.objects.filter(
        cheminement=cheminement,
        session=session_obj
    ).aggregate(total=Sum('cours__credits'))['total'] or 0

    # Vérifier le plafond de 15 crédits
    if credits_existants + cours_obj.credits > 15:
        return Response(
            {'Session complète (max 15 crédits par session).'},
            status=400
        )

    # Créer ou met à jour la liaison cours–session
    cours_session_obj, created = CoursParSession.objects.update_or_create(
        cheminement=cheminement,
        cours=cours_obj,
        defaults={'session': session_obj}
    )

    if created:
        return Response({'message': 'Cours associé à la session.'})
    else:
        return Response({'message': 'La liaison existait déjà : session mise à jour.'})

#vue pour supprimer un cours par session
@api_view(['DELETE'])
def supprimer_cours_par_session(request, id):
    try:
        cours_par_session = CoursParSession.objects.get(id=id)
        cours_par_session.delete()
        #cours_par_session.save()
        return Response({"message": "Cours supprimé avec succès"}, status=204)
    except CoursParSession.DoesNotExist:
        return Response({"error": "CoursParSession non trouvé"}, status=404)

# vue pour modifier un cours par session
@api_view(['PUT'])
def modifier_cours_par_session(request, id):
    try:
        cps = CoursParSession.objects.get(id=id)
    except CoursParSession.DoesNotExist:
        return JsonResponse({"error": "CoursParSession non trouvé"}, status=404)

    new_cours_id = request.data.get("cours_id")
    new_session_id = request.data.get("session_id")

    if new_cours_id:
        cps.cours_id = new_cours_id
    if new_session_id:
        cps.session_id = new_session_id

    cps.save()
    return JsonResponse({"message": "CoursParSession mis à jour avec succès"}, status=200)

#vue pour generer un cheminement
@api_view(['POST'])
def generer_cheminement(request):
    SESSIONS_COMPLETES = ["Automne 1", "Hiver 1", "Automne 2", "Hiver 2", "Automne 3", "Hiver 3"]
    etudiant_id = request.data.get("id_etudiant")

    try:
        etudiant = Etudiant.objects.get(id=etudiant_id)
    except Etudiant.DoesNotExist:
        return JsonResponse({"error": "Étudiant non trouvé"}, status=404)

    programme = etudiant.programme
    cours_programme = list(Cours.objects.filter(programme=programme))
    prerequis_dict = defaultdict(list)
    for p in Prerequis.objects.all():
        prerequis_dict[p.cours_id].append(p.prerequis_id)

    cheminement, _ = Cheminement.objects.get_or_create(etudiant=etudiant)

    # Créer/récupérer les sessions
    sessions = {}
    for label in SESSIONS_COMPLETES:
        nom, num = label.split()
        session_obj, _ = Session.objects.get_or_create(nom_session=nom, numero_session=int(num))
        sessions[label] = session_obj

    session_labels = list(sessions.keys())
    session_index = 0

    # Cours déjà affectés
    cours_faits = set(
        CoursParSession.objects.filter(cheminement=cheminement)
        .values_list('cours_id', flat=True)
    )
    cours_restants = set(c.id for c in cours_programme) - cours_faits

    # Boucle d'affectation
    while cours_restants:
        label = session_labels[session_index % len(session_labels)]
        session_obj = sessions[label]
        total_credits_session = 0
        ajout_dans_cycle = []

        for cid in list(cours_restants):
            # critères de prérequis
            if all(pr in cours_faits for pr in prerequis_dict[cid]):
                cours_obj = Cours.objects.get(id=cid)
                if total_credits_session + cours_obj.credits <= 15:
                    # ne pas réaffecter si déjà lié
                    existing = CoursParSession.objects.filter(
                        cheminement=cheminement, cours=cours_obj
                    ).first()
                    if not existing:
                        CoursParSession.objects.create(
                            cheminement=cheminement,
                            cours=cours_obj,
                            session=session_obj
                        )
                    total_credits_session += cours_obj.credits
                    ajout_dans_cycle.append(cid)

        for cid in ajout_dans_cycle:
            cours_faits.add(cid)
            cours_restants.remove(cid)

        session_index += 1
        if not ajout_dans_cycle and session_index >= len(session_labels):
            break

    # Préparer le résultat par session
    resultat_sessions = []
    for label in SESSIONS_COMPLETES:
        nom, num = label.split()
        cps_qs = CoursParSession.objects.filter(
            cheminement=cheminement,
            session=sessions[label]
        )
        cours_list = [
            {
                "code_cours": cps.cours.code_cours,
                "nom_cours": cps.cours.nom_cours,
                "prerequis": list(
                    Prerequis.objects.filter(cours=cps.cours)
                    .values_list("prerequis__code_cours", flat=True)
                )
            }
            for cps in cps_qs
        ]
        resultat_sessions.append({
            "session": label,
            "nom_session": nom,
            "numero_session": int(num),
            "cours": cours_list
        })

    # **Ceci : cours optionnels + total des crédits**
    cours_optionnels = Cours.objects.filter(programme=programme, est_optionnel=True)
    optionnels_data = [
        {"code_cours": c.code_cours, "nom_cours": c.nom_cours}
        for c in cours_optionnels
    ]

    total_credits_programme = sum(c.credits for c in cours_programme)

    return JsonResponse({
        "cours_par_session": resultat_sessions,
        "cours_optionnels": optionnels_data,
        "credits_totaux": total_credits_programme
    }, safe=False)


#vue pour generer un graphe
@api_view(['GET'])
def generer_graphe(request):
    programme_id = request.GET.get("programme_id")
    etudiant_id = request.GET.get("etudiant_id")

    if not programme_id:
        return JsonResponse({"error": "Programme requis"}, status=400)

    cours_list = list(
        CoursParSession.objects.filter(cours__programme_id=programme_id)
        .select_related("cours", "session", "cheminement")
        .values("cours__id", "cours__code_cours", "cours__nom_cours", "session__numero_session")
    )

    cours_faits_ids = set()
    if etudiant_id:
        try:
            etudiant = Etudiant.objects.get(id=etudiant_id)
            cheminement = Cheminement.objects.get(etudiant=etudiant)
            cours_faits_ids = set(
                CoursParSession.objects.filter(cheminement=cheminement)
                .values_list("cours_id", flat=True)
            )
        except (Etudiant.DoesNotExist, Cheminement.DoesNotExist):
            pass

    nodes = []
    edges = []

    for c in cours_list:
        cours_id = c["cours__id"]
        nodes.append({
            "id": cours_id,
            "label": c["cours__code_cours"],
            "nom": c["cours__nom_cours"],
            "session": c["session__numero_session"],
            "fait": cours_id in cours_faits_ids
        })
        for p in Prerequis.objects.filter(cours_id=cours_id):
            edges.append({"from": p.prerequis_id, "to": cours_id})

    return JsonResponse({"nodes": nodes, "edges": edges}, safe=False)
